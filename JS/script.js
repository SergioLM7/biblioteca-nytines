document.addEventListener('DOMContentLoaded', () => {

  //VARIABLES
  const fragment = document.createDocumentFragment();
  const sectionCards = document.querySelector('#cards');
  const sectionFilters = document.querySelector('#filters')
  const selectFilter = document.querySelector('#filter');
  const selectFilterCategories = document.querySelector('#filterCategory');
  const selectAToZ = document.querySelector('#filterAToZ');
  const botonFilterCategories = document.querySelector('.buttonFilter');
  const selectFilterOldest = document.querySelector('#filterOldest');
  const selectFilterNewest = document.querySelector('#filterNewest');
  const sectionBooksFilters = document.querySelector('#booksFilters');
  const selectBookAToZ = document.querySelector('#bookFilterAToZ');
  const selectAuthorAToZ = document.querySelector('#authorFilterAToZ');

  //let datosFiltrados = [];
  let botonCard;
  let arrayBack = JSON.parse(localStorage.getItem('arrayBack')) || [];
  let arrayBackBooks = [];


  //EVENTOS
  //Evento para acceder al género de los libros
  sectionCards.addEventListener('click', ({ target }) => {
    if (target.tagName === 'BUTTON' && target.dataset.link) {
      cleanDOM(sectionBoton);
      const linkURL = target.dataset.link;
      accesoAPILista2(linkURL);
    }
  });

  //Evento para filtrar por categorías que se actualizan semanal o mensualmente (con opción de
  //quitar el filtro y mostrarlos todos)
  selectFilter.addEventListener('change', ({ target }) => {
    if (target.value === 'weekly') {
      cleanDOM(sectionCards);
      filtrarCards('weekly');
    } else if (target.value === 'monthly') {
      cleanDOM(sectionCards);
      filtrarCards('monthly');
    } else {
      cleanDOM(sectionCards);
      pintarCards(arrayBack);
    }
  });

  //Evento para filtrar por orden alfabético y a la inversa las listas
  selectAToZ.addEventListener('change', ({ target }) => {
    if (target.value === 'aToz') {
      filterAlphabetical('aToz');
    } else if (target.value === 'zToa') {
      filterAlphabetical('zToa');
    }
    resetSelects();
  });

  //Evento para filtrar por oldest_published_date
  selectFilterOldest.addEventListener('change', ({ target }) => {
    if (target.value === 'toOldest') {
      filterByOldest('toOldest');
    } else if (target.value === 'fromOldest') {
      filterByOldest('fromOldest');
    }
    resetSelects();
  });

  //Evento para filtrar por newest_published_date
  selectFilterNewest.addEventListener('change', ({ target }) => {
    if (target.value === 'toNewest') {
      filterByNewest('toNewest');
    } else if (target.value === 'fromNewest') {
      filterByNewest('fromNewest');
    }
    resetSelects();
  });


  //Evento para filtrar por los géneros de las listas
  botonFilterCategories.addEventListener('click', (evento) => {
    evento.preventDefault();
    let optionsSelected = selectFilterCategories.selectedOptions;
    let arraySelectedOptions = [];
    for (let i = 0; i < optionsSelected.length; i++) {
      arraySelectedOptions.push(optionsSelected[i].value);
    }
    if (arraySelectedOptions.includes('Todas')) {
      cleanDOM(sectionCards);
      pintarCards(arrayBack);
    } else {
      let arrayFiltrado = arrayBack.filter(elemento => arraySelectedOptions.includes(elemento.list_name));
      cleanDOM(sectionCards);
      pintarCards(arrayFiltrado);
    }
    resetSelects();
  });

  //Evento para filtrar por orden alfabético y a la inversa en base a los libros
  selectBookAToZ.addEventListener('change', ({ target }) => {
    if (target.value === 'aToz') {
      cleanDOM(sectionBoton);
      filterAlphabeticalTitles('aToz');
    } else if (target.value === 'zToa') {
      cleanDOM(sectionBoton);
      filterAlphabeticalTitles('zToa');
    }
    resetSelects();
  });

  //Evento para filtrar por orden alfabético y a la inversa en base a los autores
  selectAuthorAToZ.addEventListener('change', ({ target }) => {
    if (target.value === 'aToz') {
      cleanDOM(sectionBoton);
      filterAlphabeticalAuthors('aToz');
    } else if (target.value === 'zToa') {
      cleanDOM(sectionBoton);
      filterAlphabeticalAuthors('zToa');
    }
    resetSelects();
  });

  //Evento para volver al Index
  sectionBoton.addEventListener('click', ({ target }) => {
    if (target.classList.contains('botonBack')) {
      cleanDOM(sectionCards);
      cleanDOM(sectionTituloLista);
      pintarCards(arrayBack);
      sectionFilters.style.display = 'flex';
      cleanDOM(sectionBoton);
    }
  });

  //FUNCIONES
  //Función de acceso inicial a la API
  const accesoAPI = async () => {
    mostrarSpinner();
    try {
      const respuesta = await fetch('https://api.nytimes.com/svc/books/lists/names.json?api-key=AxAIDguQa4ASm7ICC6g7eMqm1XG0WPLx', {
        method: 'GET',
      });
      if (!respuesta.ok) {
        return Promise.reject(new Error(`¡Error HTTP! Estado: ${respuesta.status}`));
      } else {
        let respuestaOK = await respuesta.json();
        let listasAPintar = respuestaOK.body.results;
        arrayBack = listasAPintar;
        localStorage.setItem('arrayBack', JSON.stringify(arrayBack));

        pintarCards(listasAPintar);
        ocultarSpinner();
      }
    } catch (error) {
      ocultarSpinner();
      throw error;
    }
  };

  //Función de acceso a la API para 2ª lista
  const accesoAPILista2 = async (link) => {
    mostrarSpinner();
    arrayBackBooks = [];
    try {
      const respuesta2 = await fetch(`https://api.nytimes.com/svc/books/lists/${link}.json?api-key=AxAIDguQa4ASm7ICC6g7eMqm1XG0WPLx`, {
        method: 'GET'
      });
      if (!respuesta2.ok) {
        return Promise.reject(new Error(`¡Error HTTP! Estado: ${respuesta2.status}`));
      } else {
        let respuesta2OK = await respuesta2.json();
        let datosLista = respuesta2OK.body;
        arrayBackBooks = [...datosLista];
        console.log(datosLista);
        cleanDOM(sectionCards);
        sectionFilters.style.display = 'none';
        sectionBooksFilters.style.display = 'flex';
        pintarCardsTematicas(datosLista);
        ocultarSpinner();
      }

    } catch (error) {
      ocultarSpinner();
      throw error;
    }
  };


  //Función para pintar las listas
  const pintarCards = (datos) => {

    datos.forEach(({ list_name: nombre, oldest_published_date: masAntiguo,
      newest_published_date: masNuevo, updated, list_name_encoded: link }) => {

      const contenedorCard = document.createElement("ARTICLE");
      contenedorCard.classList = "contenedorCard"
      const h3Card = document.createElement("H3");
      h3Card.innerHTML = nombre;
      const optionCard = document.createElement("OPTION");
      optionCard.value = nombre;
      optionCard.id = nombre;
      optionCard.name = nombre;
      optionCard.textContent = nombre;
      const hrCard = document.createElement("HR");
      const datoOldest = document.createElement("P");
      datoOldest.textContent = `Oldest: ${masAntiguo}`;
      const datoNewest = document.createElement("P");
      datoNewest.textContent = `Newest: ${masNuevo}`;
      const datoUpdated = document.createElement("P");
      datoUpdated.classList = 'filterSelect';
      datoUpdated.textContent = `Updated: ${updated}`;
      botonCard = document.createElement("BUTTON");
      botonCard.textContent = "READ MORE";
      botonCard.dataset.link = link;
      selectFilterCategories.append(optionCard);
      fragment.append(h3Card, hrCard, datoOldest, datoNewest, datoUpdated, botonCard)
      contenedorCard.append(fragment);
      sectionCards.append(contenedorCard);

    })
  };

  //Función para pintar las cards de cada género/temática
  const pintarCardsTematicas = (datos) => {
    window.scrollTo(0, 0);

    const sectionTituloLista = document.querySelector('#sectionTituloLista');
    const sectionBoton = document.querySelector('#sectionBoton');
    const botonBack = document.createElement('BUTTON');
    botonBack.classList = "botonBack";
    botonBack.textContent = "BACK TO INDEX";
    sectionBoton.append(botonBack);


    datos.forEach(({ list_name, rank, weeks_on_list: semanas, book_details: detalles }) => {
      sectionTituloLista.innerHTML = '';
      const titulo = detalles[0].title;
      const contenedorLibro = document.createElement("ARTICLE");
      const tituloLista = document.createElement("H3");
      tituloLista.textContent = list_name;

      contenedorLibro.classList = "contenedorLibro";
      const h4Libro = document.createElement("H4");
      h4Libro.innerHTML = `#${rank} ${titulo}`;

      const imgLibro = document.createElement("IMG");
      imgLibro.src = detalles[0].book_image;
      imgLibro.classList = "contenedor-imagen";
      imgLibro.alt = "caratula libro";

      const semanasEnLista = document.createElement("P");
      semanasEnLista.textContent = `Weeks on list: ${semanas}`;

      const description = document.createElement("P");
      description.textContent = `${detalles[0].description}`;

      const enlaceBoton = document.createElement("A");
      enlaceBoton.href = `${detalles[0].amazon_product_url}`;
      enlaceBoton.target = "_blank";
      const botonComprar = document.createElement("BUTTON");
      botonComprar.textContent = "BUY AT AMAZON";


      enlaceBoton.append(botonComprar);
      fragment.append(h4Libro, imgLibro, semanasEnLista, description, enlaceBoton)
      contenedorLibro.append(fragment);
      sectionCards.append(contenedorLibro);
      sectionTituloLista.append(tituloLista);
    })

  };

  //Función para limpiar el DOM 
  const cleanDOM = (element) => {
    element.innerHTML = '';
  };

  //Función reset selects
  const resetSelects = () => {
    selectFilterCategories.value = 'todas';
    selectFilter.value = 'all';
    selectAToZ.value = 'sinFiltro';
    selectFilterOldest.value = "noOrder";
    selectFilterNewest.value = 'noOrder';
    selectBookAToZ.value = 'bookNoFilter';
    selectAuthorAToZ.value = 'bookNoFilter';
  };

  //Función para filtrar por categorías actualizadas weekly o monthly
  const filtrarCards = (filtro) => {
    let filtroAPintar = [...arrayBack].filter(card => card.updated.toLowerCase() === filtro);
    console.log(filtroAPintar)
    pintarCards(filtroAPintar);
  };

  //Función para filtrar las categorías por orden alfabético
  const filterAlphabetical = (value) => {
    if (value === 'aToz') {
      let alphabeticalFilter = [...arrayBack].sort((a, b) => {
        if (a.list_name < b.list_name) {
          return -1;
        } else if (a.list_name > b.list_name) {
          return 1;
        } return 0;
      });
      console.log(alphabeticalFilter)
      cleanDOM(sectionCards);
      pintarCards(alphabeticalFilter);
    } else if (value === 'zToa') {
      let alphabeticalFilter = [...arrayBack].sort((a, b) => {
        if (a.list_name > b.list_name) {
          return -1;
        } else if (a.list_name < b.list_name) {
          return 1;
        } return 0;
      });
      console.log(alphabeticalFilter)
      cleanDOM(sectionCards);
      console.log(arrayBack)
      pintarCards(alphabeticalFilter);
    }

  };

  //Función para filtrar las categorías por su oldest_published_date
  const filterByOldest = (value) => {
    if (value === 'fromOldest') {
      let oldestFilter = [...arrayBack].sort((a, b) => {
        let oldestA = new Date(a.oldest_published_date);
        let oldestB = new Date(b.oldest_published_date);
        if (oldestA.getTime() < oldestB.getTime()) {
          return -1;
        } else if (oldestA.getTime() > oldestB.getTime()) {
          return 1;
        } return 0;
      });
      cleanDOM(sectionCards);
      pintarCards(oldestFilter);
    } else if (value === 'toOldest') {
      let oldestFilter = [...arrayBack].sort((a, b) => {
        let oldestA = new Date(a.oldest_published_date);
        let oldestB = new Date(b.oldest_published_date);
        if (oldestA.getTime() > oldestB.getTime()) {
          return -1;
        } else if (oldestA.getTime() < oldestB.getTime()) {
          return 1;
        } return 0;
      });
      cleanDOM(sectionCards);
      pintarCards(oldestFilter);
    }
  };

  //Función para filtrar las categorías por su newest_published_date
  const filterByNewest = (value) => {
    if (value === 'fromNewest') {
      let newestFilter = [...arrayBack].sort((a, b) => {
        let newestA = new Date(a.oldest_published_date);
        let newestB = new Date(b.oldest_published_date);
        if (newestA.getTime() < newestB.getTime()) {
          return -1;
        } else if (newestA.getTime() > newestB.getTime()) {
          return 1;
        } return 0;
      });
      cleanDOM(sectionCards);
      pintarCards(newestFilter);
    } else if (value === 'toNewest') {
      let newestFilter = [...arrayBack].sort((a, b) => {
        let newestA = new Date(a.oldest_published_date);
        let newestB = new Date(b.oldest_published_date);
        if (newestA.getTime() > newestB.getTime()) {
          return -1;
        } else if (newestA.getTime() < newestB.getTime()) {
          return 1;
        } return 0;
      });
      cleanDOM(sectionCards);
      pintarCards(newestFilter);
    }
  };

  //Función para filtrar los títulos de los libros por orden alfabético
  const filterAlphabeticalTitles = (value) => {
    if (value === 'aToz') {
      let alphabeticalFilterTitle = [...arrayBackBooks].sort((a, b) => {
        if (a.book_details[0].title < b.book_details[0].title) {
          return -1;
        } else if (a.book_details[0].title > b.book_details[0].title) {
          return 1;
        } return 0;
      });
      console.log(alphabeticalFilterTitle)
      cleanDOM(sectionCards);
      pintarCardsTematicas(alphabeticalFilterTitle);
    } else if (value === 'zToa') {
      let alphabeticalFilterTitle = [...arrayBackBooks].sort((a, b) => {
        if (a.book_details[0].title > b.book_details[0].title) {
          return -1;
        } else if (a.book_details[0].title < b.book_details[0].title) {
          return 1;
        } return 0;
      });
      console.log(alphabeticalFilterTitle)
      cleanDOM(sectionCards);
      pintarCardsTematicas(alphabeticalFilterTitle);
    }

  };
  //Función para filtrar los títulos de los libros por orden alfabético
  const filterAlphabeticalAuthors = (value) => {
    if (value === 'aToz') {
      let alphabeticalFilterAuthor = [...arrayBackBooks].sort((a, b) => {
        if (a.book_details[0].author < b.book_details[0].author) {
          return -1;
        } else if (a.book_details[0].author > b.book_details[0].author) {
          return 1;
        } return 0;
      });
      console.log(alphabeticalFilterAuthor)
      cleanDOM(sectionCards);
      pintarCardsTematicas(alphabeticalFilterAuthor);
    } else if (value === 'zToa') {
      let alphabeticalFilterAuthor = [...arrayBackBooks].sort((a, b) => {
        if (a.book_details[0].author > b.book_details[0].author) {
          return -1;
        } else if (a.book_details[0].author < b.book_details[0].author) {
          return 1;
        } return 0;
      });
      console.log(alphabeticalFilterAuthor)
      cleanDOM(sectionCards);
      pintarCardsTematicas(alphabeticalFilterAuthor);
    }

  };

  //Función para filtrar por géneros de libros(filtra la segunda llamada a la API)
  /*const filtrarLibros = (filtro2) => {
    let librosPorGenero = arrayBack.filter(card => card.nombre === filtro2);
    console.log(librosPorGenero);

  };*/

  //Funciones para gestionar el spinner de carga
  const mostrarSpinner = () => {
    spinner.style.display = 'block';
  };

  // Función para ocultar el spinner
  const ocultarSpinner = () => {
    spinner.style.display = 'none';
  };

  //Llamadas a funciones
  if (arrayBack.length === 0) {
    accesoAPI();
    sectionFilters.style.display = 'flex';
    sectionBooksFilters.style.display = 'none';
  } else {
    sectionFilters.style.display = 'flex';
    sectionBooksFilters.style.display = 'none';
    pintarCards(arrayBack);
  };




});//LOADED