import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fishData } from '../data/fishData';
import { Heart, Plus, Sparkles, Trash2 } from 'lucide-react';
import { assistantService } from '../modules/assistant/assistant.service';
import type { AssistantAskOutput } from '../modules/assistant/assistant.schema';
import { getSpeciesDisplayImage } from '../lib/speciesVisual';
import { getSpeciesFavoriteIds, setSpeciesFavoriteIds, subscribeToFavorites } from '../services/favorites/favorites.service';
import { getCurrentAquaGuideRepository } from '../services/repository/repository-provider';
import { useWorkspaceNavigation } from '../components/layout/WorkspaceNavigationProvider';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mentionedSpeciesIds?: string[];
  suggestedActions?: AssistantAskOutput['suggestedActions'];
}

interface StructuredAnswer {
  conclusion: string;
  reasons: string[];
  actions: string[];
  askNext?: string;
}

const SUGGESTED_QUESTIONS_ZH = [
  '新手适合养什么鱼？',
  '鱼缸水变浑浊怎么办？',
  '孔雀鱼怎么繁殖？',
  '新鱼入缸要注意什么？',
];

const SUGGESTED_QUESTIONS_EN = [
  'Which fish are suitable for beginners?',
  'What should I do if the aquarium water turns cloudy?',
  'How do guppies breed?',
  'What should I check when adding new fish?',
];

const CHAT_STORAGE_KEY = 'aquaguide_ai_chat_messages';

const getWelcomeMessage = (isEn: boolean): Message => ({
  id: 'welcome',
  role: 'assistant',
  content: isEn
    ? 'Hi! Ask me about species care, aquarium conditions, or problems you are seeing.'
    : '你好！可以问我物种养护、鱼缸环境，或你正在遇到的问题。',
});

const loadSavedMessages = (isEn: boolean) => {
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!saved) return [getWelcomeMessage(isEn)];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) return [getWelcomeMessage(isEn)];
    return parsed.filter((message): message is Message =>
      typeof message?.id === 'string' &&
      (message.role === 'user' || message.role === 'assistant') &&
      typeof message.content === 'string'
    );
  } catch {
    return [getWelcomeMessage(isEn)];
  }
};

const parseStructuredAnswer = (content: string): StructuredAnswer | null => {
  const normalized = content.trim();
  if (!normalized) return null;

  const conclusion = normalized.match(/(?:结论|建议)[:：]\s*([\s\S]*?)(?=\n(?:原因|理由|下一步|操作|追问|建议追问)[:：]|$)/)?.[1]?.trim();
  const reasonsBlock = normalized.match(/(?:原因|理由)[:：]\s*([\s\S]*?)(?=\n(?:下一步|操作|追问|建议追问)[:：]|$)/)?.[1]?.trim();
  const actionsBlock = normalized.match(/(?:下一步|操作)[:：]\s*([\s\S]*?)(?=\n(?:追问|建议追问)[:：]|$)/)?.[1]?.trim();
  const askNext = normalized.match(/(?:追问|建议追问)[:：]\s*([\s\S]*?)$/)?.[1]?.trim();

  if (!conclusion && !reasonsBlock && !actionsBlock) return null;

  const toList = (block?: string) => (block || '')
    .split(/\n|；|;/)
    .map(item => item.replace(/^[-*•\d.、\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 4);

  return {
    conclusion: conclusion || normalized.split('\n')[0],
    reasons: toList(reasonsBlock).slice(0, 3),
    actions: toList(actionsBlock).slice(0, 4),
    askNext,
  };
};

function AssistantAnswer({ content, isEn }: { content: string; isEn: boolean }) {
  const structured = parseStructuredAnswer(content);

  if (!structured) {
    return <span>{content}</span>;
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 text-[10px] font-black uppercase tracking-[1px] text-accent/70">{isEn ? 'Conclusion' : '结论'}</div>
        <p className="text-[14px] font-black leading-relaxed text-accent">{structured.conclusion}</p>
      </div>

      {structured.reasons.length > 0 && (
        <div>
          <div className="mb-1 text-[10px] font-black uppercase tracking-[1px] text-ink/45">{isEn ? 'Reasoning' : '为什么'}</div>
          <ul className="space-y-1.5">
            {structured.reasons.map((reason, index) => (
              <li key={`${reason}-${index}`} className="grid grid-cols-[16px_1fr] gap-1.5 text-[12px] font-medium leading-relaxed text-ink/75">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent/60" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {structured.actions.length > 0 && (
        <div>
          <div className="mb-1 text-[10px] font-black uppercase tracking-[1px] text-ink/45">{isEn ? 'Next Step' : '下一步'}</div>
          <div className="space-y-1.5">
            {structured.actions.map((action, index) => (
              <div key={`${action}-${index}`} className="rounded-sm border border-accent/15 bg-white/70 px-2.5 py-2 text-[12px] font-bold leading-relaxed text-ink">
                {index + 1}. {action}
              </div>
            ))}
          </div>
        </div>
      )}

      {structured.askNext && (
        <div className="rounded-full bg-accent/10 px-3 py-2 text-[11px] font-bold text-accent">
          {isEn ? 'You can also ask: ' : '可以继续问：'}{structured.askNext}
        </div>
      )}
    </div>
  );
}

export default function AIAssistant() {
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const { navigateToRoute } = useWorkspaceNavigation();
  const [messages, setMessages] = useState<Message[]>(() => loadSavedMessages(isEn));
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wishlistFishIds, setWishlistFishIds] = useState<Set<string>>(() => new Set(getSpeciesFavoriteIds()));
  const [favoriteSyncError, setFavoriteSyncError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(prev => prev.map(message => message.id === 'welcome' ? getWelcomeMessage(isEn) : message));
  }, [isEn]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-80)));
  }, [messages]);

  useEffect(() => {
    let active = true;
    const refreshLocal = () => {
      if (active) setWishlistFishIds(new Set(getSpeciesFavoriteIds()));
    };
    refreshLocal();
    const unsubscribe = subscribeToFavorites(refreshLocal);

    void (async () => {
      try {
        const repository = await getCurrentAquaGuideRepository();
        const favorites = await repository.getFavorites();
        if (!active) return;
        setSpeciesFavoriteIds(favorites.speciesCatalogKeys);
        setWishlistFishIds(new Set(favorites.speciesCatalogKeys));
        setFavoriteSyncError('');
      } catch (error) {
        if (!active) return;
        console.error('Failed to hydrate Assistant favorites', error);
        setFavoriteSyncError(isEn
          ? 'Saved species could not be synced. Showing this device cache.'
          : '收藏暂时无法同步，当前展示此设备缓存。');
      }
    })();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [isEn]);

  const handleClearChat = () => setIsClearConfirmOpen(true);
  const confirmClearChat = () => {
    setMessages([getWelcomeMessage(isEn)]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setIsClearConfirmOpen(false);
  };

  const addToWishlist = async (speciesId: string) => {
    if (wishlistFishIds.has(speciesId)) return;
    try {
      const repository = await getCurrentAquaGuideRepository();
      await repository.updateFavorite({ type: 'species', catalogKey: speciesId, favorite: true });
      const favorites = await repository.getFavorites();
      setSpeciesFavoriteIds(favorites.speciesCatalogKeys);
      setWishlistFishIds(new Set(favorites.speciesCatalogKeys));
      setFavoriteSyncError('');
    } catch (error) {
      console.error('Failed to save Assistant favorite', error);
      setFavoriteSyncError(isEn
        ? 'Species was not saved because the favorite could not be persisted.'
        : '收藏没有保存成功，本次修改未生效。');
    }
  };

  const handleSend = async (textToSubmit?: string) => {
    const text = textToSubmit || input;
    if (!text.trim() || isLoading) return;

    localStorage.setItem('ai_queries_count', ((parseInt(localStorage.getItem('ai_queries_count') || '0', 10)) + 1).toString());

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSubmit) setInput('');
    setIsLoading(true);

    try {
      const recentMessages = [...messages, userMessage].slice(-12);
      const response = await assistantService.ask({
        question: userMessage.content,
        history: recentMessages
          .filter(message => message.id !== userMessage.id)
          .map(message => ({ role: message.role, content: message.content })),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer || (isEn ? 'I could not understand that question. Please try rephrasing it.' : '我没有理解这个问题，可以换一种说法再试。'),
        mentionedSpeciesIds: response.mentionedSpeciesIds,
        suggestedActions: response.suggestedActions,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isEn ? 'AI is temporarily unavailable. Please try again later.' : 'AI 暂不可用，请稍后再试。'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-frame flex min-h-[calc(100dvh-150px)] min-w-0 max-w-full flex-col overflow-x-hidden">
      <header className="mb-4 flex min-w-0 items-start justify-between gap-3 md:items-center">
        <div className="min-w-0">
          <h1 className="mb-1 font-serif text-[34px] font-bold leading-tight text-ink">{isEn ? 'AI Tank Copilot' : 'AI 养鱼助手'}</h1>
          <p className="text-xs font-medium text-ink/80">{isEn ? 'Supports follow-up questions. Chat history stays in this browser.' : '支持连续追问，历史对话保存在当前浏览器。'}</p>
        </div>
        {messages.length > 1 && (
          <button
            type="button"
            onClick={handleClearChat}
            className="mt-1 inline-flex h-9 shrink-0 items-center rounded-sm border border-border bg-white px-2 text-[11px] font-bold text-ink/60 hover:text-red-500"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            {isEn ? 'Clear' : '清空'}
          </button>
        )}
      </header>
      {favoriteSyncError && (
        <div role="alert" className="mb-3 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800">
          {favoriteSyncError}
        </div>
      )}
      
      <div className="flex min-h-[560px] flex-1 flex-col overflow-hidden border border-border bg-white p-3 md:flex-row md:gap-4 md:p-4 lg:min-h-[680px]">
        <ScrollArea className="flex-1 pr-2 md:basis-[66%] md:pr-3" ref={scrollRef}>
          <div className="flex flex-col gap-4 md:pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-sm px-3 py-2 text-[13px] leading-[1.65] md:max-w-[75%] ${
                  message.role === 'user'
                    ? 'ml-8 border border-border bg-bg text-ink font-medium md:ml-auto'
                    : 'mr-8 border border-accent/10 bg-accent-light/60 text-accent font-bold md:mr-auto'
                }`}
              >
                {message.role === 'user' ? (
                  message.content
                ) : (
                  <>
                    <AssistantAnswer content={message.content} isEn={isEn} />
                    {message.mentionedSpeciesIds && message.mentionedSpeciesIds.length > 0 && (
                      <div className="mt-3 grid gap-2">
                        {message.mentionedSpeciesIds.map(speciesId => {
                          const species = fishData.find(fish => fish.id === speciesId);
                          if (!species) return null;
                          const isAdded = wishlistFishIds.has(speciesId);
                          return (
                            <div key={speciesId} className="flex items-center gap-2 rounded-sm border border-accent/15 bg-white px-2.5 py-2 transition-colors hover:border-accent md:max-w-[360px]">
                              <button
                                type="button"
                                onClick={() => navigateToRoute(`/encyclopedia?species=${encodeURIComponent(speciesId)}&source=assistant`)}
                                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                              >
                                <img src={getSpeciesDisplayImage(species)} alt={species.name} className="h-9 w-12 shrink-0 object-contain" loading="lazy" />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[12px] font-black text-ink">{species.name}</span>
                                  <span className="block truncate text-[10px] font-bold text-ink/50">{species.category}</span>
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => void addToWishlist(speciesId)}
                                disabled={isAdded}
                                aria-label={isAdded ? (isEn ? 'Saved' : '已收藏') : (isEn ? 'Save species' : '收藏物种')}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-accent hover:bg-accent/10 disabled:cursor-default disabled:opacity-65"
                              >
                                {isAdded ? <Heart className="h-4 w-4 fill-accent" /> : <Plus className="h-4 w-4" />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="mt-2 border-t border-border pt-2 text-[13px] italic text-ink/60 font-medium">
                {isEn ? 'Generating an answer…' : '正在生成回答…'}
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="mt-3 flex flex-col gap-2 md:basis-[34%] md:justify-between md:border-l md:border-border/70 md:pl-4">
          {messages.length === 1 && (
            <div className="mb-1 flex flex-wrap gap-2 md:max-w-[280px]">
              {(isEn ? SUGGESTED_QUESTIONS_EN : SUGGESTED_QUESTIONS_ZH).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  className="flex items-center rounded-sm border border-border bg-bg px-3 py-1.5 text-[11px] font-medium text-ink/80 transition-colors hover:border-accent hover:text-accent md:w-fit md:max-w-[280px]"
                >
                  <Sparkles className="w-3 h-3 mr-1 opacity-50" />
                  {q}
                </button>
              ))}
            </div>
          )}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2 md:flex-col"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isEn ? 'Ask a question…' : '输入问题…'}
              disabled={isLoading}
              className="h-auto flex-1 rounded-none border-border p-2.5 text-xs font-medium text-ink shadow-none placeholder:text-ink/50 focus-visible:ring-1 focus-visible:ring-accent md:desktop-input-limit"
            />
            <Button type="submit" disabled={!input.trim() || isLoading} className="h-auto rounded-none bg-accent px-4 text-xs font-bold text-white hover:bg-accent/90 md:desktop-action-fit">
              {isEn ? 'Send' : '发送'}
            </Button>
          </form>
        </div>
      </div>
      <ConfirmDialog
        open={isClearConfirmOpen}
        title={isEn ? 'Clear chat history?' : '清空历史对话？'}
        description={isEn ? 'This removes the saved AI assistant conversation from this browser.' : '这会删除当前浏览器中保存的 AI 助手历史对话。'}
        confirmLabel={isEn ? 'Clear' : '清空'}
        cancelLabel={isEn ? 'Cancel' : '取消'}
        destructive
        onConfirm={confirmClearChat}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
}
