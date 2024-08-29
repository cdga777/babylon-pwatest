import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { resolveRouterPath } from '../router';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { styles } from '../styles/shared-styles';
import { AbstractEngine, Engine, FreeCamera, HemisphericLight, IWebXRFeature, Mesh, MeshBuilder, Scene, Vector3, WebXRDefaultExperience, WebXRFeatureName, WebXRFeaturesManager, WebXRState } from 'babylonjs';

@customElement('app-home')
export class AppHome extends LitElement {

  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';
  private _engine: Engine | undefined;
  private _scene: Scene | undefined;
  private _canvas: HTMLCanvasElement | undefined;
  private _xrHelper?: WebXRDefaultExperience;
  private _camera?: FreeCamera | null;
  private _state: WebXRState = WebXRState.NOT_IN_XR;
  private _teleportation?: IWebXRFeature;
  private _featureManager?: WebXRFeaturesManager;

  static styles = [
    styles,
    css`
    #welcomeBar {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    #welcomeCard,
    #infoCard {
      padding: 18px;
      padding-top: 0px;
    }

    sl-card::part(footer) {
      display: flex;
      justify-content: flex-end;
    }

    @media(min-width: 750px) {
      sl-card {
        width: 70vw;
      }
    }


    @media (horizontal-viewport-segments: 2) {
      #welcomeBar {
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
      }

      #welcomeCard {
        margin-right: 64px;
      }
    }
  `];

  public get state(): WebXRState {
    return this._state;
  }

  public get currentCamera(): FreeCamera | undefined | null {
    if(this.state === WebXRState.IN_XR){
        return this._xrHelper?.baseExperience.camera;
    }else{
        return this._camera;
    }
  }

  constructor() {
    super();

    console.log("starting");
  }

  async firstUpdated() {
    const self = this;
    this._canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    this._engine = new Engine(this._canvas, true, { stencil: true });
    //this._engine.displayLoadingUI();

    this._scene = new Scene(this._engine);
    var box = MeshBuilder.CreateBox("box", {});
    var box2 = box.clone("box_clone");
    box2.position.x = 20;
    box2.position.y = 20;
    this._scene.createDefaultCameraOrLight(true, true, true);
    this._scene.createDefaultEnvironment();
    this._camera = this._scene.activeCamera as FreeCamera;

    try {
      this._xrHelper = await this._scene.createDefaultXRExperienceAsync();
    } catch {
      console.log("error while creating xr experience. Most likely no device");
    }

    const vrCam = this._xrHelper?.baseExperience.camera;
        if (this._xrHelper?.baseExperience) {
            this._xrHelper.baseExperience.onStateChangedObservable.add((state) => {

            });
            this._xrHelper.teleportation.onAfterCameraTeleport.add((targetPosition) => {
                if(this.currentCamera) this.currentCamera.position.y = targetPosition.y + 0.5;
            });

            this._featureManager = this._xrHelper.baseExperience.featuresManager;
            this._teleportation = this._featureManager.enableFeature(WebXRFeatureName.TELEPORTATION, "latest", {
                xrInput: this._xrHelper.input,
                //floorMeshes: [this._world.ground],
                //renderingGroupId: 1,

                defaultTargetMeshOptions: {
                    disableLighting: true,
                },
            });
        }

    // Get the canvas DOM element
    //var canvas = document.getElementById('renderCanvas');
    // Load the 3D engine
    //var engine = new Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
    // CreateScene function that creates and return the scene
    /*var createScene = function(){
        // Create a basic BJS Scene object
        var scene = new Scene(self._engine as AbstractEngine);
        // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
        var camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene);
        // Target the camera to scene origin
        camera.setTarget(Vector3.Zero());
        // Attach the camera to the canvas
        camera.attachControl(self._canvas, false);
        // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
        var light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);
        // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
        var sphere = Mesh.CreateSphere('sphere1', 16, 2, scene, false, Mesh.FRONTSIDE);
        // Move the sphere upward 1/2 of its height
        sphere.position.y = 1;
        // Create a built-in "ground" shape; its constructor takes 6 params : name, width, height, subdivision, scene, updatable
        var ground = Mesh.CreateGround('ground1', 6, 6, 2, scene, false);
        // Return the created scene
        return scene;
    }
    // call the createScene function
    this._scene = createScene();*/
    // run the render loop
    this._engine.runRenderLoop(function(){
      self._scene?.render();
    });
    // the canvas/window resize event handler
    window.addEventListener('resize', function(){
      self._engine?.resize();
    });


    // this method is a lifecycle even in lit
    // for more info check out the lit docs https://lit.dev/docs/components/lifecycle/
    console.log('This is your home page');
  }

  share() {
    if ((navigator as any).share) {
      (navigator as any).share({
        title: 'PWABuilder pwa-starter',
        text: 'Check out the PWABuilder pwa-starter!',
        url: 'https://github.com/pwa-builder/pwa-starter',
      });
    }
  }

  render() {

  }
}
