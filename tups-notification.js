// =================================
// TUPS GLOBAL NOTIFICATION SYSTEM
// =================================


function showTUPSNotification(message){


    let box =
    document.getElementById(
        "tupsNotification"
    );


    if(!box){

        console.log(
            message
        );

        return;

    }


    const text =
    String(message)
    .toLowerCase();



    let type =
    "success";



    if(

        text.includes("error") ||

        text.includes("failed") ||

        text.includes("invalid") ||

        text.includes("please") ||

        text.includes("select") ||

        text.includes("enter") ||

        text.includes("required")

    ){

        type =
        "error";

    }



    box.className =
    "tups-" + type;



    box.innerHTML =
    message;



    box.style.display =
    "block";



    setTimeout(()=>{

        box.style.display =
        "none";

    },3000);



}



// =================================
// OVERRIDE NORMAL ALERT
// =================================

window.alert =
function(message){

    showTUPSNotification(
        message
    );

};
