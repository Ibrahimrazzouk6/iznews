export function createSkeletonCard() {
  return `
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-line" style="width:35%"></div>
        <div class="skeleton-line" style="width:90%;height:13px"></div>
        <div class="skeleton-line" style="width:75%;height:13px"></div>
        <div class="skeleton-line" style="width:100%;margin-top:4px"></div>
        <div class="skeleton-line" style="width:80%"></div>
        <div class="skeleton-line" style="width:65%"></div>
        <div class="skeleton-line" style="width:28%;margin-top:6px;height:12px"></div>
      </div>
    </div>`;
}

export function renderSkeletons(container, count = 12) {
  if (!container) return;
  container.innerHTML = Array.from({ length: count }, createSkeletonCard).join('');
}
