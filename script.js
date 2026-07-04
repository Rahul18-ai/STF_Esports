const teamsContainer =
    document.getElementById("teamsContainer");

const teamTemplate =
    document.getElementById("teamTemplate");

const STORAGE_KEY =
    "bgmi_pmgo_dashboard";

const DEFAULT_LOGO =
    "assets/default-logo.png";

const EXPORT_WIDTH = 1080;

const EXPORT_HEIGHT = 1920;

let teams = [];

let isExporting = false;


/* =========================================================
   CREATE DEFAULT TEAMS
========================================================= */

function createDefaultTeams() {

    teams = [];

    for (let i = 1; i <= 25; i++) {

        teams.push({

            id: i,

            name: `Team ${i}`,

            logo: DEFAULT_LOGO,

            wwcd: 0,

            matches: 0,

            placement: 0,

            elims: 0,

            total: 0
        });
    }

    saveAuto();

    renderTeams();
}


/* =========================================================
   NORMALIZE DATA
========================================================= */

function normalizeTeams(savedTeams) {

    if (!Array.isArray(savedTeams)) {

        return [];
    }

    return savedTeams.map((team, index) => {

        const placement =
            Number(team.placement) || 0;

        const elims =
            Number(team.elims) || 0;

        return {

            id:
                Number(team.id) ||
                index + 1,

            name:
                team.name ??
                `Team ${index + 1}`,

            logo:
                team.logo ||
                DEFAULT_LOGO,

            wwcd:
                Number(team.wwcd) || 0,

            matches:
                Number(team.matches) || 0,

            placement:
                placement,

            elims:
                elims,

            total:
                placement + elims
        };
    });
}


/* =========================================================
   COMPARE TEAMS
========================================================= */

function compareTeams(a, b) {

    if (b.total !== a.total) {

        return b.total - a.total;
    }

    if (b.elims !== a.elims) {

        return b.elims - a.elims;
    }

    return a.id - b.id;
}


/* =========================================================
   GET LEADER
========================================================= */

function getLeader() {

    if (!teams.length) {

        return null;
    }

    return [...teams].sort(compareTeams)[0];
}


/* =========================================================
   UPDATE LEADER
========================================================= */

function updateLeader() {

    const leader =
        getLeader();

    if (!leader) {

        return;
    }

    document.getElementById("leaderName").textContent =
        leader.name;

    document.getElementById("leaderLogo").src =
        leader.logo || DEFAULT_LOGO;

    document.getElementById("leaderWWCD").textContent =
        leader.wwcd;

    document.getElementById("leaderMatches").textContent =
        leader.matches;

    document.getElementById("leaderPlacement").textContent =
        leader.placement;

    document.getElementById("leaderElims").textContent =
        leader.elims;

    document.getElementById("leaderTotal").textContent =
        leader.total;
}


/* =========================================================
   RENDER TEAMS
========================================================= */

function renderTeams() {

    teamsContainer.innerHTML = "";

    teams.forEach((team, index) => {

        const clone =
            teamTemplate.content.cloneNode(true);

        const teamCard =
            clone.querySelector(".team-card");

        teamCard.dataset.teamId =
            team.id;


        /* RANK */

        const rankBox =
            clone.querySelector(".rank-box");

        rankBox.textContent =
            "#" + (index + 1);

        rankBox.classList.remove(
            "gold",
            "silver",
            "bronze"
        );

        if (index === 0) {

            rankBox.classList.add("gold");
        }

        if (index === 1) {

            rankBox.classList.add("silver");
        }

        if (index === 2) {

            rankBox.classList.add("bronze");
        }


        /* LOGO */

        const logo =
            clone.querySelector(".team-logo");

        const logoUpload =
            clone.querySelector(".logo-upload");

        logo.src =
            team.logo || DEFAULT_LOGO;


        logoUpload.addEventListener(
            "change",
            function (event) {

                const file =
                    event.target.files[0];

                if (!file) {

                    return;
                }

                if (!file.type.startsWith("image/")) {

                    alert(
                        "Please select an image file."
                    );

                    event.target.value = "";

                    return;
                }

                const reader =
                    new FileReader();

                reader.onload =
                    function (readerEvent) {

                        const uploadedLogo =
                            readerEvent.target.result;

                        team.logo =
                            uploadedLogo;

                        logo.src =
                            uploadedLogo;

                        saveAuto();

                        updateLeader();
                    };

                reader.onerror =
                    function () {

                        alert(
                            "Could not load logo."
                        );
                    };

                reader.readAsDataURL(file);
            }
        );


        /* TEAM NAME */

        const teamName =
            clone.querySelector(".team-name");

        teamName.value =
            team.name;

        teamName.addEventListener(
            "input",
            function () {

                team.name =
                    teamName.value;

                saveAuto();

                updateLeader();
            }
        );


        /* WWCD */

        const wwcd =
            clone.querySelector(".wwcd");

        wwcd.value =
            team.wwcd;

        wwcd.addEventListener(
            "input",
            function () {

                team.wwcd =
                    Number(wwcd.value) || 0;

                saveAuto();

                updateLeader();
            }
        );


        /* MATCHES */

        const matches =
            clone.querySelector(".matches");

        matches.value =
            team.matches;

        matches.addEventListener(
            "input",
            function () {

                team.matches =
                    Number(matches.value) || 0;

                saveAuto();

                updateLeader();
            }
        );


        /* PLACEMENT */

        const placement =
            clone.querySelector(".placement");

        placement.value =
            team.placement;

        placement.addEventListener(
            "input",
            function () {

                team.placement =
                    Number(placement.value) || 0;

                updateTotal(
                    team,
                    teamCard
                );
            }
        );

        placement.addEventListener(
            "change",
            sortTeams
        );


        /* ELIMS */

        const elims =
            clone.querySelector(".elims");

        elims.value =
            team.elims;

        elims.addEventListener(
            "input",
            function () {

                team.elims =
                    Number(elims.value) || 0;

                updateTotal(
                    team,
                    teamCard
                );
            }
        );

        elims.addEventListener(
            "change",
            sortTeams
        );


        /* TOTAL */

        clone.querySelector(
            ".total-box"
        ).textContent =
            team.total;


        teamsContainer.appendChild(clone);
    });

    updateLeader();
}


/* =========================================================
   UPDATE TOTAL
========================================================= */

function updateTotal(team, teamCard) {

    team.total =

        (Number(team.placement) || 0)

        +

        (Number(team.elims) || 0);

    const totalBox =
        teamCard.querySelector(
            ".total-box"
        );

    if (totalBox) {

        totalBox.textContent =
            team.total;
    }

    saveAuto();

    updateLeader();
}


/* =========================================================
   SORT
========================================================= */

function sortTeams() {

    teams.sort(compareTeams);

    saveAuto();

    renderTeams();
}


/* =========================================================
   SAVE
========================================================= */

function saveAuto() {

    try {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(teams)
        );

    } catch (error) {

        console.error(
            "Save error:",
            error
        );
    }
}


function saveData() {

    saveAuto();

    alert(
        "Data Saved Successfully"
    );
}


/* =========================================================
   LOAD
========================================================= */

function loadData() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (!saved) {

        alert(
            "No Saved Data Found"
        );

        return;
    }

    try {

        teams =
            normalizeTeams(
                JSON.parse(saved)
            );

        teams.sort(compareTeams);

        renderTeams();

        alert(
            "Data Loaded"
        );

    } catch (error) {

        console.error(error);

        alert(
            "Saved Data Is Invalid"
        );
    }
}


/* =========================================================
   RESET
========================================================= */

function resetData() {

    const confirmReset =
        confirm(
            "Reset Tournament Data?"
        );

    if (!confirmReset) {

        return;
    }

    localStorage.removeItem(
        STORAGE_KEY
    );

    createDefaultTeams();
}


/* =========================================================
   WAIT FOR IMAGE
========================================================= */

function waitForImage(image) {

    return new Promise((resolve) => {

        if (
            image.complete &&
            image.naturalWidth > 0
        ) {

            resolve();

            return;
        }

        let finished = false;

        const finish =
            function () {

                if (finished) {

                    return;
                }

                finished = true;

                clearTimeout(timeout);

                image.removeEventListener(
                    "load",
                    finish
                );

                image.removeEventListener(
                    "error",
                    finish
                );

                resolve();
            };

        const timeout =
            setTimeout(
                finish,
                3000
            );

        image.addEventListener(
            "load",
            finish,
            { once: true }
        );

        image.addEventListener(
            "error",
            finish,
            { once: true }
        );
    });
}


async function waitForImages(element) {

    const images =
        Array.from(
            element.querySelectorAll("img")
        );

    await Promise.all(
        images.map(waitForImage)
    );
}


/* =========================================================
   COPY CURRENT INPUT VALUES
========================================================= */

function copyInputValues(
    sourceContainer,
    clonedContainer
) {

    const sourceInputs =
        sourceContainer.querySelectorAll(
            "input:not([type='file'])"
        );

    const clonedInputs =
        clonedContainer.querySelectorAll(
            "input:not([type='file'])"
        );

    sourceInputs.forEach(
        function (input, index) {

            if (clonedInputs[index]) {

                clonedInputs[index].value =
                    input.value;

                clonedInputs[index].setAttribute(
                    "value",
                    input.value
                );
            }
        }
    );
}


/* =========================================================
   CONVERT INPUTS TO TEXT FOR EXPORT
========================================================= */

function convertInputsToText(exportContainer) {

    exportContainer
        .querySelectorAll(
            ".team-card input[type='text'], " +
            ".team-card input[type='number']"
        )
        .forEach(function (input) {

            const text =
                document.createElement("div");

            text.className =
                "export-input-text";

            text.textContent =
                input.value;

            text.style.width =
                "100%";

            text.style.height =
                "42px";

            text.style.display =
                "flex";

            text.style.alignItems =
                "center";

            text.style.justifyContent =
                "center";

            text.style.padding =
                "2px 4px";

            text.style.overflow =
                "hidden";

            text.style.whiteSpace =
                "nowrap";

            text.style.textOverflow =
                "ellipsis";

            text.style.borderRadius =
                "6px";

            text.style.color =
                "#ffffff";

            text.style.fontSize =
                "17px";

            text.style.lineHeight =
                "1";

            text.style.background =
                "rgba(255,255,255,.08)";

            input.replaceWith(text);
        });
}


/* =========================================================
   BUILD EXPORT ELEMENT
========================================================= */

function buildExportElement() {

    const sourceContainer =
        document.querySelector(
            ".container"
        );

    const exportStage =
        document.createElement("div");

    exportStage.id =
        "pngExportStage";

    exportStage.style.position =
        "fixed";

    exportStage.style.left =
        "-12000px";

    exportStage.style.top =
        "0";

    exportStage.style.width =
        EXPORT_WIDTH + "px";

    exportStage.style.height =
        EXPORT_HEIGHT + "px";

    exportStage.style.overflow =
        "hidden";

    exportStage.style.margin =
        "0";

    exportStage.style.padding =
        "0";

    exportStage.style.color =
        "#ffffff";

    exportStage.style.backgroundImage =

        "linear-gradient(" +

        "rgba(0,0,0,.75)," +

        "rgba(0,0,0,.90)" +

        ")," +

        "url('assets/bg.jpg')";

    exportStage.style.backgroundSize =
        "cover";

    exportStage.style.backgroundPosition =
        "center top";

    exportStage.style.backgroundRepeat =
        "no-repeat";


    const exportContainer =
        sourceContainer.cloneNode(true);


    copyInputValues(
        sourceContainer,
        exportContainer
    );


    exportContainer.style.width =
        EXPORT_WIDTH + "px";

    exportContainer.style.maxWidth =
        "none";

    exportContainer.style.minHeight =
        EXPORT_HEIGHT + "px";

    exportContainer.style.margin =
        "0";

    exportContainer.style.padding =
        "20px";

    exportContainer.style.boxSizing =
        "border-box";


    /* REMOVE CONTROLS */

    const controls =
        exportContainer.querySelector(
            ".controls"
        );

    if (controls) {

        controls.remove();
    }


    /* REMOVE FIRST TEAM */

    const firstTeam =
        exportContainer.querySelector(
            ".team-card"
        );

    if (firstTeam) {

        firstTeam.remove();
    }


    /* REMOVE ALL UPLOAD BUTTONS FROM EXPORT */

exportContainer
    .querySelectorAll(
        ".upload-button, .brand-upload-button"
    )
    .forEach(function (button) {

        button.remove();
    });

    /* HEADER EXPORT */

    const header =
        exportContainer.querySelector(
            ".header"
        );

    header.style.display =
        "grid";

    header.style.gridTemplateColumns =
        "minmax(0,1fr) auto";

    header.style.gap =
        "14px";

    header.style.padding =
        "18px";


    const eventSection =
        exportContainer.querySelector(
            ".event-section"
        );

    eventSection.style.gridColumn =
        "1 / -1";

    eventSection.style.width =
        "100%";


    const eventInput =
        exportContainer.querySelector(
            "#tournamentName"
        );

    eventInput.style.width =
        "100%";

    eventInput.style.fontSize =
        "24px";


    const dayInput =
        exportContainer.querySelector(
            "#dayNumber"
        );

    dayInput.style.width =
        "130px";

    dayInput.style.fontSize =
        "20px";


    /* LEADER EXPORT */

    const leaderPanel =
        exportContainer.querySelector(
            ".leader-panel"
        );

    leaderPanel.style.display =
        "block";

    leaderPanel.style.padding =
        "18px";


    const leaderLeft =
        exportContainer.querySelector(
            ".leader-left"
        );

    leaderLeft.style.display =
        "grid";

    leaderLeft.style.gridTemplateColumns =
        "auto auto minmax(0,1fr)";

    leaderLeft.style.marginBottom =
        "14px";


    const leaderStats =
        exportContainer.querySelector(
            ".leader-stats"
        );

    leaderStats.style.display =
        "grid";

    leaderStats.style.gridTemplateColumns =
        "repeat(5,minmax(0,1fr))";

    leaderStats.style.width =
        "100%";


    /* TABLE EXPORT */

    const exportColumns =

        "70px " +

        "95px " +

        "minmax(0,1fr) " +

        "95px " +

        "95px " +

        "105px " +

        "105px " +

        "115px";


    const standings =
        exportContainer.querySelector(
            ".standings"
        );

    standings.style.padding =
        "12px";

    standings.style.overflow =
        "hidden";


    const standingsHeader =
        exportContainer.querySelector(
            ".standings-header"
        );

    standingsHeader.style.display =
        "grid";

    standingsHeader.style.width =
        "100%";

    standingsHeader.style.minWidth =
        "0";

    standingsHeader.style.gridTemplateColumns =
        exportColumns;

    standingsHeader.style.gap =
        "6px";

    standingsHeader.style.padding =
        "9px";

    standingsHeader.style.fontSize =
        "16px";


    exportContainer
        .querySelectorAll(
            ".team-card"
        )
        .forEach(function (card) {

            card.style.display =
                "grid";

            card.style.width =
                "100%";

            card.style.minWidth =
                "0";

            card.style.gridTemplateColumns =
                exportColumns;

            card.style.gap =
                "6px";

            card.style.minHeight =
                "57px";

            card.style.padding =
                "6px";

            card.style.marginBottom =
                "5px";
        });


    exportContainer
        .querySelectorAll(
            ".rank-box"
        )
        .forEach(function (rank) {

            rank.style.width =
                "42px";

            rank.style.height =
                "42px";

            rank.style.fontSize =
                "15px";
        });


    exportContainer
        .querySelectorAll(
            ".team-logo"
        )
        .forEach(function (logo) {

            logo.style.width =
                "45px";

            logo.style.height =
                "45px";
        });


    convertInputsToText(
        exportContainer
    );


    /* CORRECT LEADER */

    const leader =
        getLeader();

    if (leader) {

        const leaderLogo =
            exportContainer.querySelector(
                "#leaderLogo"
            );

        leaderLogo.src =
            leader.logo ||
            DEFAULT_LOGO;

        exportContainer.querySelector(
            "#leaderName"
        ).textContent =
            leader.name;

        exportContainer.querySelector(
            "#leaderWWCD"
        ).textContent =
            leader.wwcd;

        exportContainer.querySelector(
            "#leaderMatches"
        ).textContent =
            leader.matches;

        exportContainer.querySelector(
            "#leaderPlacement"
        ).textContent =
            leader.placement;

        exportContainer.querySelector(
            "#leaderElims"
        ).textContent =
            leader.elims;

        exportContainer.querySelector(
            "#leaderTotal"
        ).textContent =
            leader.total;
    }


    exportStage.appendChild(
        exportContainer
    );

    document.body.appendChild(
        exportStage
    );

    return exportStage;
}


/* =========================================================
   EXPORT PNG
========================================================= */

async function exportImage() {

    if (isExporting) {
        return;
    }

    const exportBtn =
        document.getElementById("exportBtn");

    let exportStage = null;

    isExporting = true;

    exportBtn.disabled = true;

    exportBtn.textContent = "EXPORTING...";

    try {

        if (typeof window.html2canvas !== "function") {

            throw new Error(
                "html2canvas library is not loaded."
            );
        }


        /* =================================================
           UPDATE CURRENT DATA
        ================================================= */

        teams.sort(compareTeams);

        saveAuto();

        renderTeams();

        updateLeader();


        /* =================================================
           WAIT FOR FONTS
        ================================================= */

        if (
            document.fonts &&
            document.fonts.ready
        ) {

            await document.fonts.ready;
        }


        /* =================================================
           WAIT FOR CURRENT IMAGES
        ================================================= */

        const mainContainer =
            document.querySelector(".container");


        await waitForImages(mainContainer);


        /* =================================================
           BUILD EXPORT ELEMENT
        ================================================= */

        exportStage =
            buildExportElement();


        await waitForImages(exportStage);


        await new Promise((resolve) => {

            requestAnimationFrame(() => {

                requestAnimationFrame(resolve);
            });
        });


        /* =================================================
           GET EXPORT CONTAINER
        ================================================= */

        const exportContainer =
            exportStage.querySelector(".container");


        if (!exportContainer) {

            throw new Error(
                "Export container not found."
            );
        }


        /* =================================================
           REMOVE EXPORT BACKGROUND

           IMPORTANT:

           We will draw bg.jpg manually onto final canvas.

           This prevents duplicated/cropped backgrounds.
        ================================================= */

        exportStage.style.background = "transparent";

        exportContainer.style.background = "transparent";


        /* =================================================
           GET REAL CONTENT HEIGHT
        ================================================= */

        exportContainer.style.height = "auto";

        exportContainer.style.minHeight = "0";


        await new Promise((resolve) => {

            requestAnimationFrame(resolve);
        });


        const contentHeight =
            Math.ceil(
                exportContainer.scrollHeight
            );


        if (!contentHeight) {

            throw new Error(
                "Could not calculate dashboard height."
            );
        }


        /* =================================================
           CAPTURE FULL DASHBOARD
        ================================================= */

        const sourceCanvas =
            await window.html2canvas(

                exportContainer,

                {

                    width:
                        EXPORT_WIDTH,

                    height:
                        contentHeight,

                    windowWidth:
                        EXPORT_WIDTH,

                    windowHeight:
                        contentHeight,

                    scale:
                        1,

                    scrollX:
                        0,

                    scrollY:
                        0,

                    useCORS:
                        true,

                    allowTaint:
                        false,

                    backgroundColor:
                        null,

                    logging:
                        false
                }
            );


        /* =================================================
           CREATE FINAL 1080 × 1920 CANVAS
        ================================================= */

        const finalCanvas =
            document.createElement("canvas");


        finalCanvas.width =
            EXPORT_WIDTH;


        finalCanvas.height =
            EXPORT_HEIGHT;


        const ctx =
            finalCanvas.getContext("2d");


        if (!ctx) {

            throw new Error(
                "Could not create final canvas."
            );
        }


        /* =================================================
           LOAD BACKGROUND IMAGE
        ================================================= */

        const backgroundImage =
            new Image();


        /*
        IMPORTANT:

        assets/bg.jpg must exist.
        */


        const backgroundPromise =
            new Promise((resolve, reject) => {


                backgroundImage.onload =
                    () => resolve();


                backgroundImage.onerror =
                    () => reject(

                        new Error(

                            "Could not load assets/bg.jpg"

                        )

                    );


                backgroundImage.src =
                    "assets/bg.jpg";
            });


        await backgroundPromise;


        /* =================================================
           DRAW BACKGROUND WITH CSS COVER BEHAVIOR
        ================================================= */

        const imageWidth =
            backgroundImage.naturalWidth;


        const imageHeight =
            backgroundImage.naturalHeight;


        const canvasRatio =

            EXPORT_WIDTH /

            EXPORT_HEIGHT;


        const imageRatio =

            imageWidth /

            imageHeight;


        let sourceX = 0;

        let sourceY = 0;

        let sourceWidth =
            imageWidth;

        let sourceHeight =
            imageHeight;


        /*
        CROP BACKGROUND LIKE:

        background-size: cover;
        */


        if (imageRatio > canvasRatio) {


            sourceWidth =

                imageHeight *

                canvasRatio;


            sourceX =

                (imageWidth - sourceWidth)

                / 2;


        } else {


            sourceHeight =

                imageWidth /

                canvasRatio;


            sourceY =

                (imageHeight - sourceHeight)

                / 2;
        }


        ctx.drawImage(

            backgroundImage,

            sourceX,

            sourceY,

            sourceWidth,

            sourceHeight,

            0,

            0,

            EXPORT_WIDTH,

            EXPORT_HEIGHT
        );


        /* =================================================
           DRAW DARK OVERLAY

           SAME EFFECT AS WEBSITE BODY BACKGROUND
        ================================================= */

        const overlayGradient =
            ctx.createLinearGradient(

                0,

                0,

                0,

                EXPORT_HEIGHT
            );


        overlayGradient.addColorStop(

            0,

            "rgba(0,0,0,0.75)"
        );


        overlayGradient.addColorStop(

            1,

            "rgba(0,0,0,0.90)"
        );


        ctx.fillStyle =
            overlayGradient;


        ctx.fillRect(

            0,

            0,

            EXPORT_WIDTH,

            EXPORT_HEIGHT
        );


        /* =================================================
           ADD BLUE RADIAL OVERLAY

           SAME AS .bg-overlay
        ================================================= */

        const radialGradient =
            ctx.createRadialGradient(

                EXPORT_WIDTH / 2,

                EXPORT_HEIGHT / 2,

                0,

                EXPORT_WIDTH / 2,

                EXPORT_HEIGHT / 2,

                EXPORT_WIDTH * 0.7
            );


        radialGradient.addColorStop(

            0,

            "rgba(0,200,255,0.12)"
        );


        radialGradient.addColorStop(

            0.5,

            "rgba(0,200,255,0)"
        );


        radialGradient.addColorStop(

            1,

            "rgba(0,200,255,0)"
        );


        ctx.fillStyle =
            radialGradient;


        ctx.fillRect(

            0,

            0,

            EXPORT_WIDTH,

            EXPORT_HEIGHT
        );


        /* =================================================
           CALCULATE DASHBOARD SCALE

           ALL TEAMS MUST FIT INSIDE 1920 HEIGHT
        ================================================= */

        const horizontalMargin =
            18;


        const verticalMargin =
            18;


        const availableWidth =

            EXPORT_WIDTH -

            horizontalMargin * 2;


        const availableHeight =

            EXPORT_HEIGHT -

            verticalMargin * 2;


        const widthScale =

            availableWidth /

            sourceCanvas.width;


        const heightScale =

            availableHeight /

            sourceCanvas.height;


        /*
        USE SMALLER SCALE.

        This guarantees:

        - complete width
        - complete height
        - all teams visible
        */


        const fitScale =

            Math.min(

                widthScale,

                heightScale,

                1

            );


        const scaledWidth =

            sourceCanvas.width *

            fitScale;


        const scaledHeight =

            sourceCanvas.height *

            fitScale;


        const offsetX =

            (EXPORT_WIDTH -

            scaledWidth)

            / 2;


        const offsetY =

            Math.max(

                verticalMargin,

                (
                    EXPORT_HEIGHT -

                    scaledHeight

                ) / 2

            );


        /* =================================================
           DRAW COMPLETE DASHBOARD
        ================================================= */

        ctx.drawImage(

            sourceCanvas,

            0,

            0,

            sourceCanvas.width,

            sourceCanvas.height,

            offsetX,

            offsetY,

            scaledWidth,

            scaledHeight
        );


        /* =================================================
           REMOVE TEMP EXPORT ELEMENT
        ================================================= */

        exportStage.remove();

        exportStage = null;


        /* =================================================
           CREATE PNG
        ================================================= */

        let imageURL;


        try {

            imageURL =
                finalCanvas.toDataURL(

                    "image/png",

                    1
                );


        } catch (error) {


            throw new Error(

                "Could not create PNG. Check your background and logo image files."

            );
        }


        /* =================================================
           DOWNLOAD PNG
        ================================================= */

        const link =
            document.createElement("a");


        link.href =
            imageURL;


        link.download =
            "STF_ESPORTS_1080x1920.png";


        document.body.appendChild(link);


        link.click();


        link.remove();


    } catch (error) {


        console.error(

            "PNG EXPORT ERROR:",

            error

        );


        alert(

            "PNG export failed: " +

            (
                error.message ||

                error
            )
        );


    } finally {


        if (

            exportStage &&

            exportStage.parentNode

        ) {

            exportStage.remove();
        }


        isExporting = false;


        exportBtn.disabled = false;


        exportBtn.textContent =
            "EXPORT PNG";
    }
}


/* =========================================================
   BUTTON EVENTS
========================================================= */

const saveBtn =
    document.getElementById(
        "saveBtn"
    );

const loadBtn =
    document.getElementById(
        "loadBtn"
    );

const resetBtn =
    document.getElementById(
        "resetBtn"
    );

const exportBtn =
    document.getElementById(
        "exportBtn"
    );


saveBtn.addEventListener(
    "click",
    saveData
);

loadBtn.addEventListener(
    "click",
    loadData
);

resetBtn.addEventListener(
    "click",
    resetData
);

exportBtn.addEventListener(
    "click",
    exportImage
);


/* =========================================================
   START APP
========================================================= */

window.addEventListener(
    "load",
    function () {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (saved) {

            try {

                teams =
                    normalizeTeams(
                        JSON.parse(saved)
                    );

                teams.sort(
                    compareTeams
                );

                renderTeams();

            } catch (error) {

                console.error(
                    "Startup error:",
                    error
                );

                createDefaultTeams();
            }

        } else {

            createDefaultTeams();
        }
    }
);
/* =========================================================
   BRAND LOGO UPLOAD
========================================================= */

const brandLogoUpload =
    document.getElementById("brandLogoUpload");

const brandLogo =
    document.querySelector(".brand-logo");

const BRAND_LOGO_STORAGE_KEY =
    "stf_brand_logo";


brandLogoUpload.addEventListener(
    "change",
    function (event) {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {

            alert("Please select an image file.");

            event.target.value = "";

            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function (readerEvent) {

                const uploadedLogo =
                    readerEvent.target.result;


                brandLogo.src =
                    uploadedLogo;


                localStorage.setItem(
                    BRAND_LOGO_STORAGE_KEY,
                    uploadedLogo
                );
            };


        reader.readAsDataURL(file);
    }
);


/* LOAD SAVED BRAND LOGO */

window.addEventListener(
    "load",
    function () {

        const savedBrandLogo =
            localStorage.getItem(
                BRAND_LOGO_STORAGE_KEY
            );


        if (savedBrandLogo) {

            brandLogo.src =
                savedBrandLogo;
        }
    }
);
