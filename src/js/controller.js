import * as model from "./model.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

import "core-js/stable";
import "regenerator-runtime/runtime";
import resultsView from "./views/resultsView.js";

const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

// https://forkify-api.herokuapp.com/v2
///////////////////////////////////////

// light/dark mode toggling
const body = document.querySelector("body");
const toggle = document.getElementById("toggle");
const darkModeIcon = document.querySelector(".darkmode-icon");
const lightModeIcon = document.querySelector(".lightmode-icon");
const logoForkify = document.querySelector(".header__logo");
const logoForkifyLight = document.querySelector(".header__logo_light");
let root = document.documentElement;

toggle.onclick = function () {
  toggle.classList.toggle("active");
  body.classList.toggle("active");

  if (
    getComputedStyle(root).getPropertyValue("--primary-color-dark") == "#f38e82"
  ) {
    root.style.setProperty("--primary-color-dark", "rgba(55, 15, 148, 0.514)");
    root.style.setProperty(
      "--gradient-dark",
      "linear-gradient(to right bottom, #1b0f23ca, #1b0f23)"
    );
  } else {
    root.style.setProperty("--primary-color-dark", "#f38e82");
    root.style.setProperty(
      "--gradient-dark",
      "linear-gradient(to right bottom, #fbdb89, #f48982)"
    );
  }

  // toggle hidden- it works fine
  logoForkify.classList.toggle("hidden");
  logoForkifyLight.classList.toggle("hidden");
  lightModeIcon.classList.toggle("hidden");
  darkModeIcon.classList.toggle("hidden");
};

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    // window.location is the entire url
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading recipe
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const fixBookmarkControlRecipes = async function () {
  try {
    // window.location is the entire url
    const id = window.location.hash.slice(1);
    if (!id) return;

    // 1) Loading recipe
    await model.loadRecipe(id);

    // 2) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

// Empty recipe view on page reload
window.addEventListener("load", (event) => {
  history.pushState("", document.title, window.location.pathname);
});
//

const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  if (!model.state.recipe.bookmarked) fixBookmarkControlRecipes();

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, process.env.MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error("💥", err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
