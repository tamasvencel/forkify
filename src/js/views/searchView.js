class SearchView {
  _parentElement = document.querySelector(".search");

  getQuery() {
    const query = this._parentElement.querySelector(".search__field").value;
    this._clearInput();
    return query;
  }

  _clearInput() {
    this._parentElement.querySelector(".search__field").value = "";
  }

  addHandlerSearch(handler) {
    //           user clicks search button or hits enter
    //                                 ↓
    this._parentElement.addEventListener("submit", function (e) {
      e.preventDefault(); // otherwise the page is going to reload
      handler();
    });
  }
}

export default new SearchView();
