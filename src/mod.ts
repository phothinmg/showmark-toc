import Showdown, { ShowdownExtension } from "showdown";

type TocItem = {
  anchor: string;
  level: number;
  text: string;
};

type MetaInfo =
  | {
      type: "toc";
    }
  | {
      type: "header";
      anchor: string;
      level: number;
      text: string;
    };

type TocOpts = {
  listType: "ol" | "ul";
};
/**
 * Showndown Extension TOC
 * ---
 * 
 * ***Inspired by https://github.com/ahungrynoob/showdown-toc***
 *
 * Description:
 * This function is used to generate a Showdown extension for creating a table of contents (TOC) in the output HTML. It takes an optional `toc` parameter which is an array of `TocItem` objects representing the headers in the input Markdown. It also takes an optional `opts` parameter which is an object specifying the options for the TOC, such as the list type (ordered list or unordered list).
 *
 * Parameters:
 * - `toc` (optional): An array of `TocItem` objects representing the headers in the input Markdown.
 * - `opts` (optional): An object specifying the options for the TOC, such as the list type (ordered list or unordered list).
 *
 * Returns:
 * An array of `ShowdownExtension` objects representing the TOC extension for Showdown.
 *
 */
function showmarkToc({
  toc,
  opts,
}: { toc?: TocItem[]; opts?: TocOpts } = {}): ShowdownExtension[] {
  return [
    {
      type: "output",
      filter(source: string) {
        const regex =
          /(<h([1-6]).*?id="([^"]*?)".*?>(.+?)<\/h[1-6]>)|(<p>\[toc\]<\/p>)/g;

        // find and collect all headers and [toc] node;
        const collection: MetaInfo[] = [];
        source.replace(regex, (wholeMatch, _, level, anchor, text) => {
          if (wholeMatch === "<p>[toc]</p>") {
            collection.push({ type: "toc" });
          } else {
            text = text.replace(/<[^>]+>/g, "");
            const tocItem: TocItem = {
              anchor,
              level: Number(level),
              text,
            };
            if (toc) {
              toc.push(tocItem);
            }
            collection.push({
              type: "header",
              ...tocItem,
            });
          }
          return "";
        });

        // calculate toc info
        const tocCollection: TocItem[][] = [];
        collection.forEach(({ type }, index) => {
          if (type === "toc") {
            if (
              collection[index + 1] &&
              collection[index + 1].type === "header"
            ) {
              const headers: TocItem[] = [];
              const { level: levelToToc } = collection[index + 1] as TocItem;
              for (let i = index + 1; i < collection.length; i++) {
                if (collection[i].type === "toc") break;
                const { level } = collection[i] as TocItem;
                if (level === levelToToc) {
                  headers.push(collection[i] as TocItem);
                }
              }
              tocCollection.push(headers);
            } else {
              tocCollection.push([]);
            }
          }
        });

        // replace [toc] node in source
        source = source.replace(/<p>\[toc\]<\/p>[\n]*/g, () => {
          const headers = tocCollection.shift();
          if (headers && headers.length) {
            const listType = opts?.listType || "ol";
            const str = `<${listType} class="showdown-toc">${headers
              .map(
                ({ text, anchor }) =>
                  `<li><a href="#${anchor}">${text}</a></li>`
              )
              .join("")}</${listType}>\n`;
            return str;
          }
          return "";
        });

        return source;
      },
    },
  ];
}

Showdown.extension("showmarkToc", showmarkToc);
export { showmarkToc };
