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

// =================================
// TUPS CONFIRMATION SYSTEM
// =================================

function showTUPSConfirmation(
    message,
    onConfirm,
    onCancel
) {

    let overlay =
        document.getElementById(
            "tupsConfirmOverlay"
        );

    if (!overlay) {

        overlay =
            document.createElement(
                "div"
            );

        overlay.id =
            "tupsConfirmOverlay";

        overlay.innerHTML = `

            <div id="tupsConfirmBox">

                <h3 id="tupsConfirmTitle">
                    TUPS Confirmation
                </h3>

                <div id="tupsConfirmMessage"></div>

                <div class="tups-confirm-buttons">

                    <button
                        id="tupsConfirmCancel"
                        type="button"
                    >
                        Cancel
                    </button>

                    <button
                        id="tupsConfirmOK"
                        type="button"
                    >
                        Confirm
                    </button>

                </div>

            </div>

        `;

        document.body.appendChild(
            overlay
        );

    }


    document.getElementById(
        "tupsConfirmMessage"
    ).textContent =
        message;


    overlay.style.display =
        "flex";


    const cancelButton =
        document.getElementById(
            "tupsConfirmCancel"
        );

    const confirmButton =
        document.getElementById(
            "tupsConfirmOK"
        );


    // Remove previous handlers
    cancelButton.onclick = null;
    confirmButton.onclick = null;


    cancelButton.onclick =
        function () {

            overlay.style.display =
                "none";

            if (typeof onCancel === "function") {
                onCancel();
            }

        };


    confirmButton.onclick =
        function () {

            overlay.style.display =
                "none";

            if (typeof onConfirm === "function") {
                onConfirm();
            }

        };

}

