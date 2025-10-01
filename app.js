(() => {
  const state = {
    listProducts: [],
    categories: [],
    error: false,
    display: true,
  };

  function init() {
    loadInitialData();
    listeners();
    render();
  }

  //Datos iniciales
  function loadInitialData() {
    const storedCategories = JSON.parse(localStorage.getItem("categories"));
    if (storedCategories) {
      state.categories = storedCategories;
    }
    const storedProducts = JSON.parse(localStorage.getItem("products"));
    if (storedProducts) {
      state.listProducts = storedProducts;
    }
  }

  //Listeners
  function listeners() {
    const buttonShowCategories = document.getElementById("show_cats");
    const buttonDeleteCategories = document.getElementById("del_all_cats");
    if (buttonShowCategories) {
      buttonShowCategories.addEventListener("click", (e) => {
        e.preventDefault();
        state.display = !state.display;

        if (buttonShowCategories.textContent === "Mostrar Categorías") {
          console.log("textContent", buttonShowCategories.textContent);
          buttonDeleteCategories.style.display = "block";
        } else {
          buttonDeleteCategories.style.display = "none";
        }

        if (state.display === false) {
          buttonShowCategories.textContent = "Mostrar Categorías";
        } else {
          buttonShowCategories.textContent = "Ocultar Categorías";
        }
        displayCategories();
      });
    }

    const buttonAddCategory = document.getElementById("add_cat");
    if (buttonAddCategory) {
      buttonAddCategory.addEventListener("click", (e) => {
        e.preventDefault();
        addCategory();
        render();
      });
    }

    const buttonAddProduct = document.getElementById("add_product");
    if (buttonAddProduct) {
      buttonAddProduct.addEventListener("click", (e) => {
        e.preventDefault();
        addProduct();
      });
    }

    const buttonDelCategories = document.getElementById("del_all_cats");
    buttonDelCategories.addEventListener("click", () => {
      deleteAllCategories();
    });
  }

  function displayOptions() {
    const selectCategories = document.getElementById("select_cats");
    if (selectCategories) {
      selectCategories.innerHTML = "";
      const optionEmpty = document.createElement("option");
      optionEmpty.textContent = "Otros";
      selectCategories.appendChild(optionEmpty);

      for (let i = 0; i < state.categories.length; i++) {
        const option = document.createElement("option");
        option.id = `${state.categories[i]}`;
        option.textContent = `${capitalizeFirstLetter(state.categories[i])}`;
        selectCategories.appendChild(option);
      }
    }
  }

  //Funciones del producto
  function addProduct() {
    const formProduct = document.getElementById("form_product");
    const inputProduct = document.getElementById("input_product");
    const selectCat = document.getElementById("select_cats");
    if (formProduct) {
      const nameProduct = inputProduct.value;
      const category = selectCat.value;

      const exists = includeElement(
        state.listProducts,
        nameProduct.toLowerCase()
      );

      if (exists) {
        const error = displayError("Este producto ya está en la lista.");
        formProduct.appendChild(error);
        return;
      }

      if (!nameProduct || !category) {
        const error = displayError(
          "Para crear un producto, escribe el nombre y selecciona una categoría!"
        );
        formProduct.appendChild(error);
      } else {
        const product = {
          category,
          nameProduct: nameProduct.toLowerCase(),
          bought: false,
        };
        state.listProducts.push(product);
        setItemsStorage("products", state.listProducts);
        inputProduct.value = "";
      }
    }
    render();
  }

  function displayProducts() {
    const sectionList = document.getElementById("list");
    const divCategoryProduct = document.createElement("div");

    const titleListProduct = document.createElement("h3");
    titleListProduct.textContent = "Lista de productos o pendientes";

    const buttonDeleteAllProducts = document.createElement("button");
    buttonDeleteAllProducts.textContent = "Borrar Lista";
    buttonDeleteAllProducts.id = "del_all_products";

    if (sectionList) {
      sectionList.innerHTML = "";
      sectionList.appendChild(titleListProduct);

      buttonDeleteAllProducts.addEventListener("click", () => {
        deleteAllProducts();
      });
      sectionList.appendChild(buttonDeleteAllProducts);
      let categories = [];
      let filteredCategories = [];

      divCategoryProduct.id = "div_product";
      divCategoryProduct.className = "div_product";

      state.listProducts.map((product) => {
        categories.push(product.category);
      });

      filteredCategories = deleteRepeatInArray(categories);

      for (let i = 0; i < filteredCategories.length; i++) {
        const divProductsByCategory = document.createElement("div");
        divProductsByCategory.className = "div_product_by_category";

        const h3 = document.createElement("h3");
        h3.textContent = `${capitalizeFirstLetter(filteredCategories[i])}`;

        divProductsByCategory.id = `${filteredCategories[i]}`;
        divProductsByCategory.appendChild(h3);
        divCategoryProduct.appendChild(divProductsByCategory);
        for (let j = 0; j < state.listProducts.length; j++) {
          if (state.listProducts[j].category === divProductsByCategory.id) {
            const divProduct = document.createElement("div");
            divProduct.id = state.listProducts[j].nameProduct;
            divProduct.className = "item_product";

            const divCheckButton = document.createElement("div");
            divCheckButton.className = "check_button";

            const h4 = document.createElement("span");
            h4.textContent = capitalizeFirstLetter(
              state.listProducts[j].nameProduct
            );

            // Checkbox
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = state.listProducts[j].bought || false;
            checkbox.addEventListener("change", () => {
              state.listProducts[j].bought = checkbox.checked;
              setItemsStorage("products", state.listProducts);

              if (checkbox.checked) {
                h4.classList.add("bought");
              } else {
                h4.classList.remove("bought");
              }
            });

            const buttonDeleteProduct = document.createElement("button");
            buttonDeleteProduct.textContent = "X";
            buttonDeleteProduct.id = state.listProducts[j].nameProduct;
            buttonDeleteProduct.addEventListener("click", () => {
              deleteOneProduct(state.listProducts[j].nameProduct);
            });

            divProduct.appendChild(h4);
            divCheckButton.appendChild(checkbox);
            divCheckButton.appendChild(buttonDeleteProduct);
            divProduct.appendChild(divCheckButton);

            divProductsByCategory.appendChild(divProduct);
          }
        }
      }
    }
    sectionList.appendChild(divCategoryProduct);
  }

  function deleteOneProduct(name) {
    let filteredProducts = state.listProducts.filter((product) => {
      return product.nameProduct !== name;
    });
    setItemsStorage("products", filteredProducts);
    state.listProducts = filteredProducts;
    render();
  }

  function deleteAllProducts() {
    localStorage.removeItem("products");
    state.listProducts = [];

    render();
  }

  //Funciones de categorías

  function displayCategories() {
    const formCategory = document.getElementById("form_category");

    if (formCategory) {
      const divCategory = document.getElementById("div_category");
      divCategory.style.display = "none";

      if (state.display === true) {
        divCategory.innerHTML = "";
        divCategory.style.display = "flex";
        for (let i = 0; i < state.categories.length; i++) {
          const divContainerCat = document.createElement("div");
          divContainerCat.className = "div_container_cat";

          const buttonDel = document.createElement("button");
          buttonDel.textContent = " x ";
          buttonDel.addEventListener("click", () => {
            deleteOneCategory(state.categories[i]);
          });

          const span = document.createElement("span");
          span.textContent = `${capitalizeFirstLetter(state.categories[i])}`;
          span.id = `${state.categories[i]}`;
          divContainerCat.appendChild(span);
          divContainerCat.appendChild(buttonDel);
          divCategory.appendChild(divContainerCat);
        }
        formCategory.appendChild(divCategory);
      } else {
        divCategory.innerHTML = "";
        divCategory.style.display = "none";
      }
    }
  }

  function addCategory() {
    const inputCategory = document.getElementById("input_category");
    const formCategory = document.getElementById("form_category");
    if (inputCategory) {
      if (inputCategory.value === "") {
        const error = displayError(
          "Para crear una categoría, debes ingresar el nombre."
        );
        formCategory.appendChild(error);
      } else {
        const category = inputCategory.value;
        const exists = includeElement(state.categories, category.toUpperCase());

        if (exists) {
          const error = displayError("Esta categoría ya existe");
          formCategory.appendChild(error);
          return;
        }

        state.categories.push(category.toUpperCase());

        setItemsStorage("categories", state.categories);
        inputCategory.value = "";
        console.log("agregando categorias", state.categories);
      }
    }
    render();
  }

  function deleteOneCategory(name) {
    let filteredCategories = state.categories.filter((category) => {
      return category !== name;
    });
    setItemsStorage("categories", filteredCategories);
    state.categories = filteredCategories;
    render();
  }

  function deleteAllCategories() {
    localStorage.removeItem("categories");
    state.categories = [];
    render();
  }

  //Funciones Auxiliares

  function setItemsStorage(item, content) {
    localStorage.setItem(item, JSON.stringify(content));
  }

  function displayError(error) {
    if (error) {
      state.error = true;
      const divError = document.createElement("div");
      divError.className = "error-message";

      const msg = document.createElement("span");
      msg.textContent = error;

      const buttonError = document.createElement("button");
      buttonError.textContent = "X";
      buttonError.className = "close-error";
      buttonError.addEventListener("click", () => {
        state.error = false;
        divError.remove();
      });

      divError.appendChild(msg);
      divError.appendChild(buttonError);

      // Elimina automáticamente después de 3 segundos
      setTimeout(() => {
        if (divError.parentNode) {
          divError.remove();
          state.error = false;
        }
      }, 3000);

      return divError;
    }
  }

  function capitalizeFirstLetter(word) {
    if (!word) return ""; // Si es string vacío o null
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  function deleteRepeatInArray(array) {
    return [...new Set(array)];
  }

  function includeElement(array, element) {
    return array.includes(element);
  }

  //Función para renderizar de nuevo todo el screen
  function render() {
    displayProducts();
    displayOptions();
    displayCategories();

    // 👉 Mostrar u ocultar el botón según el estado
    const buttonShowCategories = document.getElementById("show_cats");
    if (buttonShowCategories) {
      if (state.categories.length > 0) {
        buttonShowCategories.style.display = "block";
      } else {
        buttonShowCategories.style.display = "none";
      }
    }
    const buttonDelAllCats = document.getElementById("del_all_cats");
    if (buttonDelAllCats) {
      if (state.categories.length > 0) {
        buttonDelAllCats.style.display = "block";
      } else {
        buttonDelAllCats.style.display = "none";
      }
    }

    const sectionList = document.getElementById("list");
    if (sectionList) {
      if (state.listProducts.length > 0) {
        sectionList.style.display = "block";
      } else {
        sectionList.style.display = "none";
      }
    }

    console.log("estado", state);
  }
  init();
})();
