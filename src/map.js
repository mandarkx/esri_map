require([
      "esri/views/MapView",
      "esri/Map",
      "esri/widgets/Sketch/SketchViewModel",
      "esri/Graphic",
      "esri/layers/GraphicsLayer",
      "dojo/domReady!"
    ], function(
      MapView, Map,
      SketchViewModel, Graphic, GraphicsLayer
    ) {
		
	
      let editGraphic;
      // GraphicsLayer to hold graphics created via sketch view model
      const tempGraphicsLayer = new GraphicsLayer();

      const map = new Map({
        basemap: "gray",
        layers: [tempGraphicsLayer]
      });

      const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-88.039894, 30.695366],
        zoom: 11
      });

      view.when(function() {
        // create a new sketch view model
        const sketchViewModel = new SketchViewModel({
          view: view,
          layer: tempGraphicsLayer,
          pointSymbol: {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            style: "square",
            color: "#8A2BE2",
            size: "16px",
            outline: { // autocasts as new SimpleLineSymbol()
              color: [0, 205, 255],
              width: 3
            }
          },
          polylineSymbol: {
            type: "simple-line", // autocasts as new SimpleLineSymbol()
            color: "#8A2BE2",
            width: "4",
            style: "dash"
          },
          polygonSymbol: {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: "rgba(0, 205, 255, 0.3)",
            style: "solid",
            outline: {
              color: "white",
              width: 1
            }
          }
        });

        setUpClickHandler();

        // Listen to create-complete event to add a newly created graphic to view
        sketchViewModel.on("create-complete", addGraphic);

        // Listen the sketchViewModel's update-complete and update-cancel events
        sketchViewModel.on("update-complete", updateGraphic);
        sketchViewModel.on("update-cancel", updateGraphic);

        //*************************************************************
        // called when sketchViewModel's create-complete event is fired.
        //*************************************************************
        function addGraphic(event) {
          // Create a new graphic and set its geometry to
          // `create-complete` event geometry.
          const graphic = new Graphic({
            geometry: event.geometry,
            symbol: sketchViewModel.graphic.symbol
          });
          tempGraphicsLayer.add(graphic);
        }

        //***************************************************************
        // called when sketchViewModel's update-complete or update-cancel
        // events are fired.
        //*************************************************************
        function updateGraphic(event) {
          // event.graphic is the graphic that user clicked on and its geometry
          // has not been changed. Update its geometry and add it to the layer
          event.graphic.geometry = event.geometry;
          tempGraphicsLayer.add(event.graphic);

          // set the editGraphic to null update is complete or cancelled.
          editGraphic = null;
        }

        // ************************************************************************************
        // set up logic to handle geometry update and reflect the update on "tempGraphicsLayer"
        // ************************************************************************************
        function setUpClickHandler() {
          view.on("click", function(event) {
            view.hitTest(event).then(function(response) {
              var results = response.results;
              // Found a valid graphic
              if (results.length && results[results.length - 1]
                .graphic) {
                // Check if we're already editing a graphic
                if (!editGraphic) {
                  // Save a reference to the graphic we intend to update
                  editGraphic = results[results.length - 1].graphic;
                  // Remove the graphic from the GraphicsLayer
                  // Sketch will handle displaying the graphic while being updated
                  tempGraphicsLayer.remove(editGraphic);
                  sketchViewModel.update(editGraphic);
                }
              }
            });
          });
        }

        //***************************************
        // activate the sketch to create a point*
        //***************************************
        var drawPointButton = document.getElementById("pointButton");
        drawPointButton.onclick = function() {
          // set the sketch to create a point geometry
          sketchViewModel.create("point");
          setActiveButton(this);
        };

        //****************************************
        // activate the sketch to create a polyline
        //****************************************
        var drawLineButton = document.getElementById("polylineButton");
        drawLineButton.onclick = function() {
          // set the sketch to create a polyline geometry
          sketchViewModel.create("polyline");
          setActiveButton(this);
        };

        //***************************************
        // activate the sketch to create a polygon
        //***************************************
        var drawPolygonButton = document.getElementById("polygonButton");
        drawPolygonButton.onclick = function() {
          // set the sketch to create a polygon geometry
          sketchViewModel.create("polygon");
          setActiveButton(this);
        };

        //***************************************
        // activate the sketch to create a rectangle
        //***************************************
        var drawRectangleButton = document.getElementById(
          "rectangleButton");
        drawRectangleButton.onclick = function() {
          // set the sketch to create a polygon geometry
          sketchViewModel.create("rectangle");
          setActiveButton(this);
        };

        //***************************************
        // activate the sketch to create a circle
        //***************************************
        var drawCircleButton = document.getElementById("circleButton");
        drawCircleButton.onclick = function() {
          // set the sketch to create a polygon geometry
          sketchViewModel.create("circle");
          setActiveButton(this);
        };

        //**************
        // reset button
        //**************
        document.getElementById("resetBtn").onclick = function() {
          sketchViewModel.reset();
          tempGraphicsLayer.removeAll();
          setActiveButton();
        };

        function setActiveButton(selectedButton) {
          // focus the view to activate keyboard shortcuts for sketching
          view.focus();
          var elements = document.getElementsByClassName("active");
          for (var i = 0; i < elements.length; i++) {
            elements[i].classList.remove("active");
          }
          if (selectedButton) {
            selectedButton.classList.add("active");
          }
        }
      });
    });