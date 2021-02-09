class ProductMenu {
  sourceDomNodes = {
    articleRows: () => [...document.querySelectorAll(".table-body > .article-row")],
    articleRowsTable: () => this.sourceDomNodes.articleRows()[0].parentElement,
    loadMoreButton: () => document.querySelector("#loadMoreButton"),
    elementAboveCPMenu: () => document.querySelector("#tabs"),
  };

  // todo
  insertMenu = () => {
    this.sourceDomNodes.elementAboveCPMenu().insertAdjacentHTML(
      "afterend",
      `
      <div id="_cp-productMenu">
        <h1 class="heading">Cardmarket Plus</h1>
        <div class="button-wrapper">
          <button id="_cp-productMenu-sortByPrice">Sort by Price</button>
        </div>
      </div>
    `
    );

    document
      .querySelector("#_cp-productMenu .button-wrapper")
      .addEventListener("click", async () => {
        this.sourceDomNodes.articleRowsTable().classList.add("_cp-loading");

        await this.loadAllArticleRows();
        this.sortArticleRowsByPrice();

        this.sourceDomNodes.articleRowsTable().classList.remove("_cp-loading");
      });
  };

  loadAllArticleRows = async () => {
    const startTime = Date.now();

    return await new Promise((resolve) => {
      const allRowsLoaded = () => !!this.sourceDomNodes.loadMoreButton()?.disabled;

      const interval = setInterval(() => {
        if (!allRowsLoaded()) {
          try {
            return this.sourceDomNodes.loadMoreButton().click();
          } catch (error) {}
        }

        clearInterval(interval);
        resolve({
          elapsedTime: Date.now() - startTime,
        });
      }, 1000);
    });
  };

  sortArticleRowsByPrice = () => {
    const getArticleRowPrice = (e) => {
      const articlePriceText = e.querySelector(".col-offer > .price-container > div > div")
        .textContent;

      const articlePrice = currency(articlePriceText, {
        symbol: "€",
        decimal: ",",
        separator: ".",
      }).value;

      return articlePrice;
    };

    // sort rows by article price
    const sortedArticleRows = this.sourceDomNodes.articleRows().sort((a, b) => {
      return getArticleRowPrice(a) - getArticleRowPrice(b);
    });

    const articleRowsTable = this.sourceDomNodes.articleRowsTable();

    // delete all rows
    articleRowsTable.innerHTML = "";
    // insert sorted rows
    sortedArticleRows.forEach((e) => articleRowsTable.insertAdjacentElement("beforeend", e));
  };

  initialize = async () => {
    this.insertMenu();
  };
}

const isProductSite = /\/Products/g.test(window.location.pathname);

if (isProductSite) {
  new ProductMenu().initialize();
}
