/**
 * 把元素捲進畫面，但只在它本來就看不到（或被 header 蓋住）的時候才捲。
 * 塔羅／紫微的解讀頁用這個：手機上點牌或點宮位時，下面的解讀面板才不用自己滑；
 * 桌機上面板本來就在旁邊，這裡就不會亂跳。
 *
 * 元素要記得加 `scroll-mt-*`，才不會被固定的 navbar 蓋住。
 */
export function revealElement(
  el: HTMLElement | null,
  block: ScrollLogicalPosition = "center"
) {
  if (!el || typeof window === "undefined") return;

  window.requestAnimationFrame(() => {
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 0;
    const headerOffset = 96; // 公告列 32px + navbar
    const usableHeight = viewportHeight - headerOffset;
    const tallerThanViewport = rect.height >= usableHeight;

    // 比視窗還高的面板：只要頂端沒被 header 蓋住就算看得到。
    const alreadyVisible =
      rect.top >= headerOffset &&
      (rect.bottom <= viewportHeight || tallerThanViewport);
    if (alreadyVisible) return;

    // 置中會把過高面板的開頭推到畫面外，這種就改成對齊頂端。
    el.scrollIntoView({
      behavior: "smooth",
      block: tallerThanViewport ? "start" : block,
    });
  });
}
