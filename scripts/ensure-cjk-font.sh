#!/usr/bin/env bash
set -euo pipefail

CACHE_DIR="${HOME}/.cache/aquaguide-noto-cjk"
LOCAL_FONT_DIR="${HOME}/.local/share/fonts/aquaguide-noto-cjk"
FONT_PATTERN='NotoSansCJK-*.ttc'

mkdir -p "${CACHE_DIR}" "${LOCAL_FONT_DIR}"

restore_cached_fonts() {
  local count
  count=$(find "${CACHE_DIR}" -maxdepth 1 -type f -name "${FONT_PATTERN}" | wc -l | tr -d ' ')
  if [[ "${count}" -eq 0 ]]; then
    return 1
  fi

  echo "Restoring ${count} cached Noto Sans CJK TTC file(s)."
  find "${CACHE_DIR}" -maxdepth 1 -type f -name "${FONT_PATTERN}" -exec cp -f {} "${LOCAL_FONT_DIR}/" \;
  return 0
}

populate_cache_from_apt() {
  local apt_retry
  apt_retry='-o Acquire::Retries=3 -o Acquire::http::Timeout=60 -o Acquire::https::Timeout=60'

  echo "CJK font cache miss; installing fonts-noto-cjk once to populate the Actions cache."
  timeout 180s sudo apt-get ${apt_retry} update
  timeout 600s sudo apt-get ${apt_retry} install -y --no-install-recommends fonts-noto-cjk

  find /usr/share/fonts/opentype/noto -maxdepth 1 -type f -name "${FONT_PATTERN}" -exec cp -f {} "${CACHE_DIR}/" \;

  local count
  count=$(find "${CACHE_DIR}" -maxdepth 1 -type f -name "${FONT_PATTERN}" | wc -l | tr -d ' ')
  if [[ "${count}" -eq 0 ]]; then
    echo "fonts-noto-cjk installed but no ${FONT_PATTERN} files were found." >&2
    exit 1
  fi

  find "${CACHE_DIR}" -maxdepth 1 -type f -name "${FONT_PATTERN}" -exec cp -f {} "${LOCAL_FONT_DIR}/" \;
}

if ! restore_cached_fonts; then
  populate_cache_from_apt
fi

fc-cache -f "${LOCAL_FONT_DIR}" >/dev/null

MATCH=$(fc-match -f '%{family}\n' 'Noto Sans CJK SC' | head -n 1)
echo "CJK font match: ${MATCH}"
if [[ "${MATCH}" != *"Noto Sans CJK SC"* ]]; then
  echo "Noto Sans CJK SC is not available after cache restore/install." >&2
  exit 1
fi
