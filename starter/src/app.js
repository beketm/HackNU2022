/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Loader } from '@googlemaps/js-api-loader';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';


 const apiOptions = {
   "apiKey": "AIzaSyDxjIZ3z2HKShQcCFHUoysxIn2LDz3NohQ"
 };

 const mapOptions = {
   "tilt": 0,
   "heading": 0,
   "zoom": 18,
   "center": { lat: 40.78017131152 , lng: -73.9681065889423  },
   "mapId": "3f6e370fa4da464e"
 }

 async function initMap() {
   const mapDiv = document.getElementById("map");

   const apiLoader = new Loader(apiOptions);
   await apiLoader.load();

   return new google.maps.Map(mapDiv, mapOptions);
 }

 async function initWebGLOverlayView (map) {
    let scene, renderer, camera, loader;
    const webGLOverlayView = new google.maps.WebGLOverlayView();



    webGLOverlayView.onAdd = () => {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera();
        const ambientLight = new THREE.AmbientLight( 0xffffff, 0.75 ); // soft white light
        scene.add( ambientLight );
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.25);
        directionalLight.position.set(0.5, -1, 0.5);
        scene.add(directionalLight);

        const geometry = new THREE.SphereGeometry( 80, 10, 32 );
        const material = new THREE.MeshBasicMaterial( { color:0x79bcee, transparent: true, opacity: 0.7 } );
        const sphere = new THREE.Mesh( geometry, material );
        scene.add( sphere );

        
  
        loader = new GLTFLoader();
        const source = "./swim.glb";
        loader.load(
          source,
          gltf => {
            gltf.scene.scale.set(2500,2500,2500);
            gltf.scene.rotation.x = 75 * Math.PI/180;
            scene.add(gltf.scene);
          }
        );
      }
  
      webGLOverlayView.onContextRestored = ({gl}) => {
        renderer = new THREE.WebGLRenderer({
          canvas: gl.canvas,
          context: gl,
          ...gl.getContextAttributes(),
        });
  
        renderer.autoClear = false;
  
        loader.manager.onLoad = () => {
          renderer.setAnimationLoop(() => {
            //  map.moveCamera({
            //   "tilt": mapOptions.tilt,
            //   "heading": mapOptions.heading,
            //   "zoom": mapOptions.zoom
            // });
  
            // if (mapOptions.tilt < 67.5) {
            //   mapOptions.tilt += 0.5
            // } else if (mapOptions.heading <= 360) {
            //   mapOptions.heading += 0.2;
            // } else {
            //   renderer.setAnimationLoop(null)
            // }
          });
        }
      }
  
  

      webGLOverlayView.onDraw = ({gl, transformer}) => {
        const latLngAltitudeLiteral = {
          lat: mapOptions.center.lat,
          lng: mapOptions.center.lng,
          altitude: 100
        }
  
        const matrix = transformer.fromLatLngAltitude(latLngAltitudeLiteral);
        camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
  
        webGLOverlayView.requestRedraw();
        renderer.render(scene, camera);
        renderer.resetState();
      }
  
  
    webGLOverlayView.setMap(map);
  }

  (async () => {
    const map = await initMap();
    initWebGLOverlayView(map);
  })();



