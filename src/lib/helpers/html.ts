// https://stackoverflow.com/a/6234804/315168
export function escapeHtml(unsafe: string): string {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

 export const buildBreadcrumbs = (pagePath) => {
    console.log(pagePath)
    const chains = [
      'ethereum'
    ]

    const parts = pagePath.split('/').slice(1);

    let currentPath = '/';
    const breadCrumbs = parts.map((pathPart, index, arr) => {
      const lastElement = arr.length - 1 === index
      currentPath = lastElement ? `${currentPath}${pathPart}` : `${currentPath}${pathPart}/`;
      return {
        url: currentPath,
        name: pathPart,
        linkActive: chains.includes(pathPart) ? false : true,
        head: lastElement
      }
    })
    //console.log('result', breadCrumbs)
    // { url: '/trading-view/exchanges',  name: 'exchanges', head: false  },
    return breadCrumbs;
  }
