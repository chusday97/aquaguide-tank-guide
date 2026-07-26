type SubmissionWindow = {
  timestamps: number[];
  touchedAt: number;
};

interface FeedbackRateLimiterOptions {
  windowMs: number;
  maxSubmissions: number;
  maxKeys: number;
}

export class FeedbackRateLimiter {
  private windows = new Map<string, SubmissionWindow>();

  constructor(private readonly options: FeedbackRateLimiterOptions) {}

  check(key: string, now = Date.now()) {
    this.prune(now);
    const cutoff = now - this.options.windowMs;
    const timestamps = (this.windows.get(key)?.timestamps || []).filter(timestamp => timestamp > cutoff);
    if (timestamps.length >= this.options.maxSubmissions) return false;
    timestamps.push(now);
    this.windows.set(key, { timestamps, touchedAt: now });
    this.trimToCapacity();
    return true;
  }

  private prune(now: number) {
    const cutoff = now - this.options.windowMs;
    for (const [key, window] of this.windows) {
      if (window.touchedAt <= cutoff) this.windows.delete(key);
    }
  }

  private trimToCapacity() {
    if (this.windows.size <= this.options.maxKeys) return;
    const oldest = [...this.windows.entries()]
      .sort((left, right) => left[1].touchedAt - right[1].touchedAt)
      .slice(0, this.windows.size - this.options.maxKeys);
    for (const [key] of oldest) this.windows.delete(key);
  }
}
