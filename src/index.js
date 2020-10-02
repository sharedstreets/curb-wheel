
import Database from './database';
import app from './app';
import CurbWheelMap from './map';
import SharedStreets from './sharedstreets';
import bboxPoly from '@turf/bbox-polygon';

import mitt from 'mitt';
import Photo from './photo';

document.addEventListener('deviceready', onDeviceReady, false);

let modalActive = false;
let deviceId;
const modal = document.querySelector('.modal');
const modalBody = document.querySelector('.modal__body');
const modalBackground = document.querySelector('.modal__background');
const connectionsList = document.querySelector('.bluetooth-connections');
const bleStatus = document.getElementById('ble-status');

const SIGNED_UPLOAD_URL = "https://zzkcv3z5xd.execute-api.us-east-1.amazonaws.com/dev"

const emitter = mitt();

var currentDevice = null;
var pollCounter = null;
var counterValue = null;

function bindClick(elementId, f) {
  // First we check if you support touch, otherwise it's click:
  let touchEvent = 'ontouchstart' in window ? 'touchstart' : 'click';
  // Then we bind via thát event. This way we only bind one event, instead of the two as below
  document.getElementById(elementId).addEventListener(touchEvent, f);
}

async function getSignedUrl(uploadPath) {
  var uploadUrlResponse = await fetch(SIGNED_UPLOAD_URL, {
        method: 'POST', // or 'PUT'
        body: JSON.stringify({key:uploadPath})
  });

  var urlData = await uploadUrlResponse.json();

  return urlData.url;
}

function resolveLocalFileSystemURL(path) {
    return new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(path, resolve, reject)
    });
}

function getFile(fileEntry) {
    return new Promise((resolve, reject) => {
      fileEntry.file(resolve, reject);
    });
}

function readBinaryFile(file) {
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.onloadend = function() {
        console.log("Successful file write: " + this.result);
        //var blob = new Blob([new Uint8Array(this.result)], { type: "image/png" });
        resolve(this.result);
    };
    reader.readAsArrayBuffer(file);
  });
}

function onDeviceReady() {

    const photo = new Photo();
    const shst = new SharedStreets();
    const map = new CurbWheelMap(app.state, emitter);

    const db = new Database();

    // setup counter value query
    app.io.getCounterValue = () => {
      return counterValue;
    };

    // setup counter value query
    app.io.getSurveys = async () => {
      return await db.getSurveys();
    };

    // setup counter value query
    app.io.getSurveyCount = async () => {
      var surveys = await db.getSurveys();
      return surveys.length;
    };

    // setup counter value query
    app.io.getGeom = (refId, p1, p2) => {
      return shst.getGeom(refId, p1, p2);
    };

    app.io.uploadJson = async (uploadPath, data) => {

      const uploadUrl = await getSignedUrl(uploadPath);

      fetch(uploadUrl, {
            method: 'PUT', // or 'PUT'
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            body: JSON.stringify(data),
      });
    };

    app.io.uploadImage = async (uploadPath, localImagePath) => {
      const uploadUrl = await getSignedUrl(uploadPath);
      let fileEntry = await resolveLocalFileSystemURL(localImagePath);
      var file = await getFile(fileEntry);
      var imageBuffer = await readBinaryFile(file);

      fetch(uploadUrl, {
            method: 'PUT', // or 'PUT'
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            body: imageBuffer,
      });
    };

    app.io.saveSurvey = async (surveyId, streetSide, data) => {
        db.insertSurvey(surveyId, streetSide, data);
    };

    app.feature["take photo"] = function (d, i) {
        var success = async() => {
          const img = await photo.openCamera();

          const data = { shsh_ref_id: app.state.street.ref,
                         side_of_street: app.state.streetSide,
                         distance: app.state.currentRollDistance };

          console.log("saving photo: " + img.nativeURL + JSON.stringify(data));

          db.insertPhoto(img.nativeURL, app.state.street.ref, data);

          app.io.addPhoto(d, img.nativeURL)
        };

        app.ui.confirm(app.constants.prompts.takePhoto, success, null);
      }

    emitter.on("mapload", () => {

        console.log("map loaded...")

        app.ui.map = map;
        app.devMode.init();

        app.ui.updateSurveyCount();

        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(map.setMapLocation);
        }

        // scan ble
        //scan();
    });

    emitter.on("fetchStreets", async (data)=> {
        const poly = bboxPoly(data.toArray().flat());
        const streets = await shst.getPolygon(poly);
        console.log(streets)
        emitter.emit('setStreets', streets);
    });

    emitter.on("selectDirection", () => {
        app.ui.mode.set("selectDirection");

        // set up UI event handlers
        bindClick("switchSide", app.ui.map.switch.side);
        bindClick("switchDirection", app.ui.map.switch.direction);
        bindClick("startSurvey", app.survey.init);
        bindClick("backButton", app.ui.back);
        bindClick("resetButton", app.survey.init);
        bindClick("validateButton", app.survey.validate);
        bindClick("addFeatureButton", app.ui.addFeature);
        bindClick("addFeatureButton", app.ui.addFeature);

        uploadData
    });

    function scan() {
        console.log("SCAN")
        let devices = [];
        console.log(connectionsList)
        while (connectionsList.firstChild) {
            connectionsList.removeChild(connectionsList.firstChild)
        }
        ble.scan([], 10, function addToList(device) {
            if (device.name && (device.name === "curbwheel" ||device.name === "counter" || device.name === "raspberrypi" ) ) {
                if (devices.indexOf(device.id) == -1 ){
                    devices.push(device.id);
                    const li = document.createElement('li');
                    const elemId = `device-${device.id}`;
                    li.id = elemId
                    li.classList.add("connection-item")
                    li.setAttribute('data-mac-address', device.id);
                    connectionsList.appendChild(li);
                    li.innerText = `${device.name} - (${device.id})`
                    bindClick(elemId, onClickConnect)
                    console.log('found ' + device.name + ': ' +  device.id);
                }

            }
        }, ()=>{console.log('no devices found')});
    }

    bindClick("upload-indicator", app.io.uploadData);

    bindClick('ble-indicator', () => {
        console.log(modalActive)
        if (modalActive) {
            modal.classList.remove('modal--visible');
            modalBackground.classList.remove('modal__background--visible');
            modalBody.classList.remove('modal__body--visible');
            modalActive = false;
        } else {
            modal.classList.add('modal--visible');
            modalBackground.classList.add('modal__background--visible');
            modalBody.classList.add('modal__body--visible');
            if (deviceId) {
                ble.disconnect(deviceId, () => {
                    bleStatus.classList.remove('ble-status--connected');
                    scan();
                }, () => console.log("cannot disconnect"));
                deviceId = undefined;
            } else {
                scan()
            }
            modalActive = true;
        }
    })

    function onClickConnect(e) {
        const target = e.target;
        const macAddress = target.getAttribute('data-mac-address');
        connect(macAddress);

    }

    function connect(macAddress) {
        currentDevice = macAddress;
        deviceId = macAddress;
        console.log('connecting to ' +  currentDevice);
        ble.connect(currentDevice, connectCallback, disconnectCallback);
    }

    function connectCallback() {
        ble.stopScan(()=>console.log("stop scan"), ()=>console.log("cannot stop scan"))
        modalActive = false;
        bleStatus.classList.add('ble-status--connected');
        modal.classList.remove('modal--visible');
        modalBackground.classList.remove('modal__background--visible');
        modalBody.classList.remove('modal__body--visible');
        console.log(modalActive)
        pollCounter = setInterval(function(){
            readBleData();
        }, 1000);
    }

    function readBleData() {
        ble.read(currentDevice, '0ee1', 'ec0e', function(data){
            var dv = new DataView(data, 0);
            counterValue = dv.getUint32(0);
            console.log('counter value: ' + counterValue)
        });
    }

    function disconnectCallback() {
        modalActive = false;
        bleStatus.classList.remove('ble-status--connected');
        clearInterval(pollCounter);
    }

}
