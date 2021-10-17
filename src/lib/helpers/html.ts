// https://stackoverflow.com/a/6234804/315168
export function escapeHtml(unsafe: string): string {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

 export const buildBreadcrumbs = (pagePath: string, readableNames) => {
    console.log(pagePath)

    // const readablePagesName = {
    //   'trading-view': 'Trading Data'
    // }

    const getReadableName = (name: string) => {
      return readableNames[name] ? readableNames[name] : name;
    }

    const parts = pagePath.split('/').slice(1);

    let currentPath = '/';
    const breadCrumbs = parts.map((pathPart, index, arr) => {
      const lastElement = arr.length - 1 === index
      currentPath = lastElement ? `${currentPath}${pathPart}` : `${currentPath}${pathPart}/`;
      return {
        url: currentPath,
        name: getReadableName(pathPart),
        linkActive: true,
        head: lastElement
      }
    })
    // { url: '/trading-view/exchanges',  name: 'exchanges', head: false  },
    return breadCrumbs;
  }

