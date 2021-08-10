let csrfToken = null;
let userId = null;

const Toast = Swal.mixin({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          onOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
});

function loadFiles(userid,token, only_starred,folder_id){
    csrfToken = token;
    userId = userid;
    $.ajax({
        url: "file_provider/",
        type: "post",
        data: {'user_id':userid, 'hidden':"",'folder_id':folder_id},
        headers: {'X-CSRFToken': csrfToken}, // for csrf token
        success: function(data) {
            showFiles(data,only_starred);
        }
    });
}
function showFiles(data, only_starred, is_option=true) {
    console.log("SHOW FILE:"+is_option);
    let container = document.getElementById("files-container");
    container.innerHTML = "";
    let file_card = document.createElement("div");
    file_card.classList.add("col-md-2","m-2","text-center","p-0","rounded");
    if(only_starred){
        let temp = Array.from(data);
        data = Array();
        for(let i = 0; i < temp.length; i++){
            if(temp[i].file_starred){
                data.push(temp[i]);
            }
        }
    }

    for(let i = 0; i < data.length; i++){
        let fileExtension = data[i].file_title.substr((data[i].file_title.lastIndexOf('.') + 1)).toUpperCase();

        let tempCard = file_card.cloneNode(true);
        tempCard.classList.add("bg-light");
        let filename = document.createElement("div");
        filename.classList.add("font-weight-bold",'bg-info','text-white','p-2','notch');
        filename.innerText = data[i].file_title.length > 20? data[i].file_title.substring(0,15)+"...": data[i].file_title;

        let filedate = document.createElement("div");
        filedate.classList.add("text-muted",'p-1','d-flex','justify-content-between');
        filedate.innerHTML = "<span class='text-left badge badge-secondary'> <i class='fas fa-calendar-check text-light'></i>&nbsp"+data[i].upload_date+"</span><span class='text-right badge badge-secondary'> <i class='fas fa-archive text-light'></i>&nbsp"+bytesToSize(parseInt(data[i].file_size))+"</span>";

        tempCard.id = "file-card-" +i;
        let element = null;
        if(Array("JPEG","PNG","JPG","GIF","TIFF","BMP","APNG","SVG","WEBP").includes(fileExtension)){
            element = document.createElement("img");
            element.height = 128;
            element.style.objectFit = "cover";

        }
        else if(Array("MP4","OGV","WEBM","MKV").includes(fileExtension)){
            element = document.createElement("video");
            element.height = 123;
            element.controls = true;
        }

        if(element != null){
            element.src = data[i].file_link;
            element.classList.add("w-100");
            tempCard.appendChild(element);
            tempCard.appendChild(filename);
            tempCard.appendChild(filedate);
            addOptions(data[i],tempCard,i,is_option);
            container.appendChild(tempCard);
        }
        else{
            d3.xml("../static/img/file_bg.svg", "image/svg+xml", function(xml) {
                let importedNode = document.importNode(xml.documentElement, true);
                importedNode.classList.add("col");
                importedNode.getElementById("ext-text").textContent = fileExtension;
                tempCard.appendChild(importedNode);
                if(Array("MP3","WAV","OGG").includes(fileExtension)){
                    importedNode.style.height = "83px";
                    element = document.createElement("audio");
                    element.controls = true;
                    element.src = data[i].file_link;
                    element.classList.add("w-100");
                    element.style.height = "40px";
                    tempCard.appendChild(element);
                }
                tempCard.appendChild(filename);
                tempCard.appendChild(filedate);
                addOptions(data[i],tempCard,i,is_option);
                container.appendChild(tempCard);
            });
        }


    }
    //file_card.remove();
}

function addOptions(data, fileCard, i, is_option) {
    console.log("ADD OPTION:"+is_option);
    let optionsCard = document.createElement("div");
    optionsCard.id = "options-"+i;
    optionsCard.classList.add("w-100");
    if(is_option){

        let starBtn = document.createElement("button");
        starBtn.classList.add("btn","col-md-4","bg-light","rounded-0","m-0");
        if(data.file_starred){
            starBtn.innerHTML = "<i class='fas fa-star text-warning'></i>";
        }
        else{
            starBtn.innerHTML = "<i class='fas fa-star text-info'></i>";
        }
        starBtn.onclick = function(){
          toggle_star({'user_id':data.user_id,'file_id':data.id}, starBtn);
        };

        let deleteBtn = document.createElement("button");
        deleteBtn.classList.add("btn","col-md-4","bg-light","rounded-0","m-0");
        deleteBtn.innerHTML = "<i class='fas fa-trash text-danger'></i>";
        deleteBtn.onclick = function(){
            Swal.fire({
              title: 'Sure?',
              text: "You won't be able to retrieve!",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#cacaca',
              confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
              if (result.value) {
                Swal.fire(
                  'Deleted!',
                  'Your file has been deleted.',
                  'success'
                );
                deleteFile({'user_id':data.user_id,'file_id':data.id, 'file_link':data.file_link.substring(1)}, fileCard);
              }
            });

        };
        optionsCard.appendChild(starBtn);
        optionsCard.appendChild(deleteBtn);

    }

    let downloadBtn = document.createElement("a");
    downloadBtn.download = true;
    downloadBtn.href = "http://localhost:8000/file_download?era="+data.file_link.substring(1)+"&iera="+data.user_id;
    downloadBtn.classList.add("btn","col-md-12","bg-dark","rounded-0","m-0");
    downloadBtn.innerHTML = "<i class='fas fa-download text-white'></i>";

    optionsCard.appendChild(downloadBtn);

    fileCard.appendChild(optionsCard);
}


function setFolderOptions(userid,container) {
$.ajax({
        url: "folder_provider/",
        type: "post",
        data: {'user_id':userid,'show_nested':true},
        headers: {'X-CSRFToken': csrfToken}, // for csrf token
        success: function(data) {
                container.innerHTML = "";
                let defaultOp = document.createElement("option");
                defaultOp.value = "";
                container.appendChild(defaultOp);

        }
    });
}

function deleteFile(sendData,element) {
    $.ajax({
        url: "delete",
        type: "post",
        data: sendData,
        headers: {'X-CSRFToken': csrfToken}, // for csrf token
        success: function(data) {
             if(data.Status){
                element.remove();
            }
            else{
                alert("Not able to delete! try again!");
            }
        }
    });
}


function toggle_star(sendData,element) {
    $.ajax({
        url: "toggle_star",
        type: "post",
        data: sendData,
        headers: {'X-CSRFToken': csrfToken}, // for csrf token
        success: function(data) {
             if(data.Status){
                element.innerHTML = "<i class='fas fa-star text-warning'></i>";
                Toast.fire({
                      icon: 'success',
                      title: 'File selected as crucial!'
                });

            }
            else{
                element.innerHTML = "<i class='fas fa-star text-info'></i>";

                Toast.fire({
                  icon: 'success',
                  title: 'File removed from crucial successfully!'
                });
            }
        }
    });
}

// Helper functions ========================================================================================================
function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes === 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function forgotPassword(csrf_Token){
    $.ajax({
        url:'forgot_password',
        type:'post',
        data:{'email':document.getElementById("pswemailbox").value},
        headers:{'X-CSRFToken':csrf_Token},
        success:function (data) {
            Toast.fire({icon:'info',title:"Reset password request email is sent, (if you are registered)"})
        }
    })
}
