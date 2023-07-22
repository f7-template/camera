//VARIAVEL GLOBAL DA IMAGEM
var image = "";

//FUNÇÃO PARA TIRAR FOTO A PARTIR DA CÂMERA
/****
 * Parâmetros:
 * onde_salvar [string] -> Pode ser 'local' ou 'remoto'
 * id_imagem_alvo [string] -> Passe o ID do elemento que vai receber a foto batida
 * url_de_destino [string] -> URL de envio do arquivo para back-end
 */
function tirarFoto(
    onde_salvar,
    id_imagem_alvo,
    url_de_destino) {

    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 50,
        saveToPhotoAlbum: true,
        sourceType: navigator.camera.PictureSourceType.CAMERA,
        correctOrientation: true,
        destinationType: Camera.DestinationType.FILE_URI
    });

    //CASO DE SUCESSO AO TIRAR FOTO 
    function onSuccess(imageURI) {
        //PEGAR ELEMENTO DE IMAGEM ALVO
        image = document.getElementById(`${id_imagem_alvo}`);
        //CARREGAR PRELOADER
        app.preloader.show();
        //MOSTRAR NO CONSOLE URI
        console.log(`imageURI: ${imageURI}`);

        //SE SALVAR IMAGEM FOR LOCAL
        if (onde_salvar == "local") {
            //SALVAR LOCALMENTE
            saveLocal(imageURI);
        }

        //SE SALVAR IMAGEM FOR REMOTO
        if (onde_salvar == "remoto") {
            //GERAR NOME ALEATORIO
            const nome_do_arquivo = generateRandomImageName();
            //CHAMANDO FUNÇÃO DE UPLOAD
            uploadFile(imageURI,
                `${nome_do_arquivo}.jpg`,
                url_de_destino,
                (err, res) => {
                    if (err) {
                        console.error(err);
                        app.preloader.hide();
                        app.dialog.alert(err);
                    } else {
                        console.log(res);
                        app.preloader.hide();
                    }
                });
        }


    }

    function onFail(message) {
        console.error(message);
        if (message !== "No Image Selected") {
            app.dialog.alert('Motivo: ' + message, '<b>FALHOU!</b>');
        }
    }
}

//FUNÇÃO PARA TIRAR FOTO A PARTIR DA GALERIA
/****
 * Parâmetros:
 * onde_salvar [string] -> Pode ser 'local' ou 'remoto'
 * id_imagem_alvo [string] -> Passe o ID do elemento que vai receber a foto batida
 * url_de_destino [string] -> URL de envio do arquivo para back-end
 */
function abrirGaleria(
    onde_salvar,
    id_imagem_alvo,
    url_de_destino
) {
    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 50,
        saveToPhotoAlbum: true,
        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
        correctOrientation: true,
        destinationType: Camera.DestinationType.FILE_URI
    });

    //CASO DE SUCESSO AO PEGAR FOTO DA GALERIA
    function onSuccess(imageURI) {
        //PEGAR ELEMENTO DE IMAGEM ALVO
        image = document.getElementById(`${id_imagem_alvo}`);
        //CARREGAR PRELOADER
        app.preloader.show();
        //MOSTRAR NO CONSOLE URI
        console.log(`imageURI: ${imageURI}`);

        //SE SALVAR IMAGEM FOR LOCAL
        if (onde_salvar == "local") {
            //SALVAR LOCALMENTE
            saveLocal(imageURI);
        }

        //SE SALVAR IMAGEM FOR REMOTO
        if (onde_salvar == "remoto") {
            //GERAR NOME ALEATORIO
            const nome_do_arquivo = generateRandomImageName();
            //CHAMANDO FUNÇÃO DE UPLOAD
            uploadFile(imageURI,
                `${nome_do_arquivo}.jpg`,
                url_de_destino,
                (err, res) => {
                    if (err) {
                        console.error(err);
                        app.preloader.hide();
                        app.dialog.alert(err);
                    } else {
                        console.log(res);
                        app.preloader.hide();
                    }
                });
        }

    }

    function onFail(message) {
        console.error(message);
        if (message !== "No Image Selected") {
            app.dialog.alert('Motivo: ' + message, '<b>FALHOU!</b>');
        }
    }

}

//FUNÇÃO DE UPLOAD REMOTO
function uploadFile(localPath, fileName, remoteUrl, callback) {
    // loads local file with http GET request
    var xhrLocal = new XMLHttpRequest()
    xhrLocal.open('get', localPath)
    xhrLocal.responseType = 'blob'
    xhrLocal.onerror = () => {
        callback(Error('Um erro ocorreu ao tentar pegar a pasta local: ' + localPath))
    }
    xhrLocal.onload = () => {
        // when data is loaded creates a file reader to read data
        var fr = new FileReader()
        fr.onload = function (e) {
            // fetch the data and accept the blob
            console.log(e)
            fetch(e.target.result)
                .then(res => res.blob())
                .then((res) => {
                    // now creates another http post request to upload the file
                    var formData = new FormData()
                    formData.append('imagem', res, fileName)
                    // post form data
                    const xhrRemote = new XMLHttpRequest()
                    //xhrRemote.responseType = 'json'
                    // log response
                    xhrRemote.onerror = () => {
                        callback(Error('Um erro ocorreu do Upload do arquivo para ' + remoteUrl))
                    }
                    xhrRemote.onload = () => {
                        // if (typeof callback === 'function') {
                        //     //$("#nomeUpload").html(xhrRemote.response);
                        //     image.src = xhrRemote.response;
                        //     callback(null, 'Upload de Arquivo Realizado: ' + xhrRemote.response)
                        // }
                        if (xhrRemote.status === 200) {
                            const response = xhrRemote.responseText;
                            image.src = response;
                            callback(null, 'Upload de Arquivo Realizado: ' + response);
                        } else {
                            callback(Error(': ' + xhrRemote.status + ' - ' + xhrRemote.statusText));
                        }
                    }

                    // create and send the reqeust
                    xhrRemote.open('POST', remoteUrl)
                    xhrRemote.send(formData)
                })
        }
        fr.readAsDataURL(xhrLocal.response) // async call
    }
    xhrLocal.send()
}

//FUNÇÃO PARA SALVAR A IMAGEM LOCALMENTE
function saveLocal(imageURI) {
    window.resolveLocalFileSystemURL(imageURI, function (fileEntry) {
        fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function () {
                var imageBase64 = this.result.split(",")[1];
                saveImageToLocalStorage(imageBase64);
            };
            reader.readAsDataURL(file);
        }, onError);
    }, onError);
}

//CASO DE ALGUM ERRO
function onError(message) {
    console.error("Erro: " + message);
}

//FUNÇÃO PARA SALVAR IMAGEM NO LOCALSTORAGE
function saveImageToLocalStorage(imageBase64) {
    try {
        localStorage.setItem("capturedImage", imageBase64);
        console.log("Foto salva no localStorage com chave 'capturedImage'.");
        image.src = "data:image/jpeg;base64," + imageBase64;
        app.preloader.hide();
    } catch (error) {
        app.preloader.hide();
        app.dialog.alert('Erro ao salvar foto!');
        console.error("Erro ao salvar foto no localStorage: " + error.message);
    }
}

//FUNÇÃO PARA MOSTRAR A IMAGEM LOCAL SALVA NO LOCALSTORAGE
function mostrarImagemLocal(id_imagem_alvo) {
    var imageBase64 = localStorage.getItem("capturedImage");

    if (imageBase64) {
        var imageElement = document.getElementById(id_imagem_alvo);
        imageElement.src = "data:image/jpeg;base64," + imageBase64;
        app.preloader.hideIn(`#${id_imagem_alvo}`);
    } else {
        console.log("Nenhuma foto encontrada no localStorage.");
        app.preloader.hideIn(`#${id_imagem_alvo}`);
    }


}

//FUNÇÃO PARA GERAR NOME DE IMAGEM ALEATORIO
function generateRandomImageName() {
    const timestamp = Date.now().toString(16);
    const randomSuffix = Math.floor(Math.random() * 10000).toString(16).padStart(4, '0');
    const imageName = timestamp + randomSuffix;
    return imageName;
}