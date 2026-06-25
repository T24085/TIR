// T.I.R. USA Redesign - Interactive Functionality
document.addEventListener("DOMContentLoaded", () => {
    
    initCoordinatesParallax();
    initStatsCounters();
    initDrawers();
    initContactForm();

});

/* -------------------------------------------------------------
   1. Coordinate Display and Parallax Effect
------------------------------------------------------------- */
function initCoordinatesParallax() {
    const techGrid = document.getElementById("techGrid");
    const mouseCoords = document.getElementById("mouseCoords");
    
    // Core coordinate offsets for Tulsa, OK (TIR HQ)
    const baseLat = 36.0858121;
    const baseLon = -95.9231828;

    window.addEventListener("mousemove", (e) => {
        // Calculate normalized coordinates (-0.5 to 0.5)
        const xNorm = (e.clientX / window.innerWidth) - 0.5;
        const yNorm = (e.clientY / window.innerHeight) - 0.5;
        
        // Shift grid slightly for 3D depth parallax
        if (techGrid) {
            techGrid.style.transform = `translate(${xNorm * 12}px, ${yNorm * 12}px)`;
        }

        // Dynamically shift coordinates text based on cursor position
        if (mouseCoords) {
            const currentLat = (baseLat + (yNorm * 0.0020000)).toFixed(7);
            const currentLon = (baseLon + (xNorm * 0.0020000)).toFixed(7);
            mouseCoords.textContent = `LAT: ${currentLat} | LON: ${currentLon}`;
        }
    });

    // Make topographic contour lines translate slightly with page scroll
    window.addEventListener("scroll", () => {
        const scrolled = window.pageYOffset;
        document.body.style.setProperty('--scroll-translate', `${scrolled * 0.15}px`);
    });
}

/* -------------------------------------------------------------
   2. Animated Statistics Counters
------------------------------------------------------------- */
function initStatsCounters() {
    const statNumbers = document.querySelectorAll(".stat-number, .emr-value");
    
    const countOptions = {
        threshold: 0.5,
        rootMargin: "0px 0px -50px 0px"
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                animateNumber(target);
                observer.unobserve(target); // Only animate once
            }
        });
    }, countOptions);

    statNumbers.forEach(num => {
        counterObserver.observe(num);
    });

    function animateNumber(element) {
        const targetVal = parseFloat(element.getAttribute("data-target"));
        const decimals = parseInt(element.getAttribute("data-decimals")) || 0;
        const duration = 2000; // 2 seconds animation
        const startTime = performance.now();
        const startVal = 0;

        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = startVal + (targetVal - startVal) * easeProgress;
            
            if (decimals > 0) {
                let formatted = currentVal.toFixed(decimals);
                if (element.classList.contains("stat-number") && targetVal === 98.7) {
                    element.textContent = formatted + "%";
                } else {
                    element.textContent = formatted;
                }
            } else {
                let formatted = Math.floor(currentVal).toLocaleString();
                if (element.classList.contains("stat-number") && targetVal === 50000) {
                    element.textContent = formatted + "+";
                } else {
                    element.textContent = formatted;
                }
            }

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }

        requestAnimationFrame(updateNumber);
    }
}

/* -------------------------------------------------------------
   3. Details Overlay Drawer Panel
------------------------------------------------------------- */
function initDrawers() {
    const drawerOverlay = document.getElementById("drawerOverlay");
    const drawerPanel = document.getElementById("drawerPanel");
    const drawerCloseBtn = document.getElementById("drawerCloseBtn");
    const drawerContent = document.getElementById("drawerContent");
    
    // Service Cards
    const serviceCards = document.querySelectorAll(".service-card");
    // Capability Items
    const capabilityItems = document.querySelectorAll(".capability-item");

    // Close drawer handlers
    drawerCloseBtn.addEventListener("click", closeDrawer);
    drawerOverlay.addEventListener("click", (e) => {
        if (e.target === drawerOverlay) closeDrawer();
    });

    // Escape key closes drawer
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && drawerOverlay.classList.contains("active")) {
            closeDrawer();
        }
    });

    // Add click listeners to Service Cards
    serviceCards.forEach(card => {
        card.addEventListener("click", () => {
            const serviceId = card.getAttribute("data-service");
            const data = serviceDrawerData[serviceId];
            if (data) {
                renderDrawer(data);
                openDrawer();
            }
        });
    });

    capabilityItems.forEach(item => {
        item.addEventListener("click", () => {
            const capId = item.getAttribute("data-cap");
            const data = capabilityDrawerData[capId];
            if (data) {
                renderDrawer(data);
                openDrawer();
            }
        });
    });

    // Event delegation for accordions inside the drawer panel
    drawerContent.addEventListener("click", (e) => {
        const header = e.target.closest(".accordion-header");
        if (header) {
            const item = header.parentElement;
            const content = item.querySelector(".accordion-content");
            const isActive = item.classList.contains("active");
            
            // Collapse all sibling items in this accordion group
            const siblingItems = item.parentElement.querySelectorAll(".accordion-item");
            siblingItems.forEach(sib => {
                sib.classList.remove("active");
                const sibContent = sib.querySelector(".accordion-content");
                if (sibContent) sibContent.style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add("active");
                content.style.maxHeight = content.scrollHeight + "px";
            }
        }
    });

    function openDrawer() {
        drawerOverlay.classList.add("active");
        document.body.style.overflow = "hidden"; // Disable scroll
    }

    function closeDrawer() {
        drawerOverlay.classList.remove("active");
        document.body.style.overflow = ""; // Re-enable scroll
    }

    function renderDrawer(data) {
        let contentHtml = `
            <div class="drawer-hdr-group">
                <span class="mono-num font-mono text-orange">${data.num || 'SPEC'}</span>
                <h2>${data.title}</h2>
            </div>
        `;

        if (data.image) {
            contentHtml += `<img src="${data.image}" alt="${data.title}" class="drawer-main-img">`;
        }

        if (data.body) {
            contentHtml += `<p class="drawer-para">${data.body}</p>`;
        }

        if (data.accordions) {
            contentHtml += `<div class="drawer-accordion">`;
            data.accordions.forEach(acc => {
                contentHtml += `
                    <div class="accordion-item">
                        <div class="accordion-header">
                            <span>${acc.title}</span>
                            <span class="accordion-icon">+</span>
                        </div>
                        <div class="accordion-content">
                            <div class="accordion-content-inner ${acc.image ? 'accordion-with-image' : ''}">
                                <div class="accordion-text">${acc.body}</div>
                                ${acc.image ? `<img src="${acc.image}" alt="${acc.title}" class="accordion-img">` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            contentHtml += `</div>`;
        }

        if (data.listTitle && data.listItems) {
            contentHtml += `<h3 class="drawer-subheading">${data.listTitle}</h3>`;
            contentHtml += `<ul class="drawer-list">`;
            data.listItems.forEach(item => {
                contentHtml += `<li>${item}</li>`;
            });
            contentHtml += `</ul>`;
        }

        if (data.techGridTitle && data.techGridItems) {
            contentHtml += `<h3 class="drawer-subheading">${data.techGridTitle}</h3>`;
            contentHtml += `<div class="drawer-tech-grid">`;
            data.techGridItems.forEach(item => {
                contentHtml += `
                    <div class="drawer-tech-item">
                        <div class="drawer-tech-title">${item.title}</div>
                        <div class="drawer-tech-desc">${item.desc}</div>
                    </div>
                `;
            });
            contentHtml += `</div>`;
        }

        if (data.extraHTML) {
            contentHtml += data.extraHTML;
        }

        drawerContent.innerHTML = contentHtml;
    }
}

/* -------------------------------------------------------------
   4. Contact Quote Form Validation & Modal Popup Control
------------------------------------------------------------- */
function initContactForm() {
    const quoteForm = document.getElementById("quoteForm");
    const formSuccess = document.getElementById("formSuccess");
    const quoteModal = document.getElementById("contact");
    const closeQuoteBtn = document.getElementById("closeQuoteBtn");
    const quoteTriggers = document.querySelectorAll('a[href="#contact"]');

    if (quoteModal) {
        // Open modal
        quoteTriggers.forEach(trigger => {
            trigger.addEventListener("click", (e) => {
                e.preventDefault();
                quoteModal.classList.add("active");
                document.body.style.overflow = "hidden"; // Disable scroll
            });
        });

        // Close modal via close button
        if (closeQuoteBtn) {
            closeQuoteBtn.addEventListener("click", closeFormModal);
        }

        // Close modal via clicking overlay background
        quoteModal.addEventListener("click", (e) => {
            if (e.target === quoteModal) {
                closeFormModal();
            }
        });

        // Close modal via Escape key
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && quoteModal.classList.contains("active")) {
                closeFormModal();
            }
        });

        function closeFormModal() {
            quoteModal.classList.remove("active");
            document.body.style.overflow = ""; // Re-enable scroll
        }
    }

    if (quoteForm) {
        quoteForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Collect Form Values (Mock submission)
            const name = document.getElementById("fullName").value;
            const company = document.getElementById("companyName").value;
            const email = document.getElementById("emailAddress").value;
            const phone = document.getElementById("phoneNumber").value;
            const service = document.getElementById("serviceType").value;
            const details = document.getElementById("projectDetails").value;
            
            console.log("Form Submitted:", { name, company, email, phone, service, details });
            
            // Show Success Notification
            formSuccess.style.display = "flex";
            quoteForm.reset();
            
            // Automatically close modal after 3 seconds
            setTimeout(() => {
                if (quoteModal && quoteModal.classList.contains("active")) {
                    quoteModal.classList.remove("active");
                    document.body.style.overflow = ""; // Re-enable scroll
                    
                    // Hide success message after transition completes
                    setTimeout(() => {
                        formSuccess.style.display = "none";
                    }, 500);
                } else {
                    formSuccess.style.display = "none";
                }
            }, 3000);
        });
    }
}

/* -------------------------------------------------------------
   5. Technical Copywriting Data Dictionaries (Live scraped content)
------------------------------------------------------------- */
const serviceDrawerData = {
    inspection: {
        num: "01",
        title: "INSPECTION SERVICES",
        image: "assets/images/tirusa/inspection_services.jpg",
        body: "Tulsa Inspection Resources (TIR) inspects full pipeline systems, process plants, pump and compressor stations, terminals, and storage tanks. We maintain a database of over 15,000 recruited and employed technicians and over 80 inspector classifications to support your project requirements.",
        accordions: [
            {
                title: "INSPECTOR CLASSIFICATIONS & QUALIFICATIONS",
                body: "TIR values our inspectors and has over 80 classifications available that can be readily deployed anywhere in the US. This includes API 1169 Certified Pipeline Construction Inspectors, Senior AWS CWI Certified Welding Inspectors, AWS CWI Certified Welding Inspectors, CPWI Certified Welding Inspectors, Utility Inspectors, NACE/AMPP Coating Inspectors, Corrosion Inspectors, Safety/Environmental Inspectors, Civil/Mechanical Inspectors, Materials Inspectors, and E&I Inspectors.",
                image: "assets/images/tirusa/inspection_services.jpg"
            },
            {
                title: "WORKFORCE DEVELOPMENT (POWERPATHWAY)",
                body: "TIR participates in the PowerPathway program. Launched in 2008, PowerPathway is a nationally recognized workforce development model that aligns with line of business to create a qualified and sustainable pipeline of candidates for the utility industry through public-private collaborations. The program promotes the use of military veterans and allows them a smooth transition into the skilled trade industry.",
                image: "assets/images/tirusa/powerpathway_logo.png"
            },
            {
                title: "VETERAN SUPPORT (DOD SKILLBRIDGE)",
                body: "TIR cherishes our partnership with the US Department of Defense (DOD) SkillBridge program allowing us the privilege to recruit and train military veterans. The program bridges the gap between military service and civilian life. TIR's ultimate goal is to assist our nation's military veterans transition back into the common sector with a unique set of skills which can be used throughout their professional career.",
                image: "assets/images/tirusa/dod_skillbridge.jpg"
            }
        ]
    },
    integrity: {
        num: "02",
        title: "PIPELINE INTEGRITY SUPPORT",
        image: "assets/images/tirusa/ili_support.jpg",
        body: "TIR has the experience and specialized equipment to support pigging, surveys, and in-line inspection projects anytime, anywhere. We provide full project data management including detailed spreadsheets, PDF reports, and GIS integration.",
        accordions: [
            {
                title: "ABOVE GROUND MARKER (AGM) GPS SURVEY",
                body: "TIR has systems in place to accurately record all location data information for AGM Survey. We have the capability to survey AGM locations using sub-meter, sub-decimeter, or sub-centimeter accuracies. A comprehensive GPS processing and quality control procedure are performed on each survey project. Standard and customized reports are available to support client GIS needs, including PODS and ESRI.",
                image: "assets/images/tirusa/agm_device.jpg"
            },
            {
                title: "PIG TRACKING & ANALYSIS",
                body: "24-hour pig tracking for all types of pigging projects (Cleaning, Batching, Gauging, Purging, ILI). Tracking takes place in all types of applications and terrains. Tracking technologies such as geophones, transmitters, receivers, computers with GPS navigation, and tracking software are all necessary for each tool run. GPS mapping allows finding stuck, lost, or stalled inline tools.",
                image: "assets/images/tirusa/agm_jeep.jpg"
            },
            {
                title: "REMOTE & REAL-TIME PIG TRACKING",
                body: "Remote & Real-Time pig tracking reduces the number of personnel in the field while also allowing key integrity stakeholders to stay plugged in to every pig run from the comfort of their normal workstation. The service offers instantaneous updates on every pig run including tool speed, map location, & estimated time to receiver via text and email alerts.",
                image: "assets/images/tirusa/remote_tracking_app.png"
            },
            {
                title: "DIG STAKING & CENTERLINE SURVEYS",
                body: "Dig site staking is based on inline inspection (ILI) defect mapping coordinates and/or manual chaining from AGMs. During excavation, we assist in verifying anomaly and target weld locations while documenting the excavation and resulting repair with comprehensive digital as-built documentation. Centerline surveys document pipeline locations to incorporate into GIS or assess bending strain.",
                image: "assets/images/tirusa/markers.jpg"
            },
            {
                title: "NORM & BENZENE MONITORING",
                body: "Following a pig run it's important to monitor for hazardous materials. In order to avoid unexpected exposure it's important to take readings of the tool when it's at the receiver. Two readings which should be monitored are NORM (Naturally Occurring Radioactive Material) and Benzene.",
                image: "assets/images/tirusa/norm_benzene.jpg"
            }
        ]
    },
    nde: {
        num: "03",
        title: "NON-DESTRUCTIVE EXAMINATION",
        image: "assets/images/mockups/nde_bg.jpg",
        body: "Pipeline integrity assessments involve utilizing specifically trained ASNT Level II TC-1A technicians, who use various technologies to identify a variety of pipeline anomalies (damage from third party excavation, corrosion, hook cracks, lack of weld fusion, dents, stress corrosion cracks). NDE technicians map the size, shape, and severity of anomalies.",
        accordions: [
            {
                title: "ASNT LEVEL II NDE TECHNICIANS",
                body: "Pipeline integrity assessments involve utilizing specifically trained ASNT Level II TC-1A technicians, who use various technologies to identify a variety of pipeline anomalies. Certified NDE technicians provide the in-ditch services to identify, analyze, scan and report anomalies. Technicians carry with them a 'standard toolbox' of physical testing equipment, or advanced systems to size critical anomalies.",
                image: "assets/images/tirusa/conventional_nde.jpg"
            },
            {
                title: "CREAFORM LASER SCANNING",
                body: "Creaform is laser scanning technology providing highly accurate (up to 50 micron) external anomaly mapping on pipelines. Paired with its proprietary Pipecheck software, it is an extremely efficient alternative to manual pit depth gauging with up to 80 times faster data acquisition. Ideal for sprawling corrosion, gouges in dents, or sensitive locations.",
                image: "assets/images/tirusa/creaform_scan.jpg"
            },
            {
                title: "PHASED ARRAY UT (PAUT)",
                body: "PAUT instruments produce accurate, detailed cross-sectional pictures of internal structures at fast inspection speeds. PAUT technology uses multiple ultrasonic elements and electronic time delays to create beams that can be focused electronically for fast inspection, full data storage, and multiple angle inspections. Includes Olympus Flaw Detectors, HydroFORM (wall mapping), FlexoFORM (pipe elbows), and AxSEAM (long seam weld scanner).",
                image: "assets/images/tirusa/axseam.png"
            },
            {
                title: "AUTOMATED UT (AUT)",
                body: "Automated Ultrasonic Testing (AUT) detects wall thickness anomalies by utilizing an enhanced UT technology which is autonomous. AUT drives the UT equipment around the pipe during scanning. The solution includes software which captures critical anomaly data to evaluate future remediation, optimizing inspection speed and visualization.",
                image: "assets/images/tirusa/hydroform.png"
            },
            {
                title: "MAGNETIC PARTICLE INSPECTION (MPI)",
                body: "MPI detects surface and near-surface discontinuities in ferromagnetic materials (iron, nickel, cobalt) by applying a magnetic field and magnetic particles. Particles are attracted to areas of magnetic flux leakage caused by defect. Certified technicians evaluate indications for location, size, and severity.",
                image: "assets/images/tirusa/mpi_ditch.jpeg"
            },
            {
                title: "RADIOGRAPHIC TESTING (RT)",
                body: "RT uses X-rays or gamma rays (Iridium-192, Selenium-75, Cobalt-60) to inspect welds without cutting into the pipe. Discontinuities are evaluated and compared to applicable codes. Offered as Conventional Film RT, Computed RT (imaging plate), Digital RT (instant laptop images), and Film Digitizing services.",
                image: "assets/images/tirusa/xray_seam_weld.jpeg"
            }
        ]
    }
};

const capabilityDrawerData = {
    ut: {
        title: "ULTRASONIC TESTING (UT)",
        image: "assets/images/tirusa/conventional_nde.jpg",
        body: "Conventional Ultrasonic Testing is widely considered the workhorse of the NDE industry. TIR's certified technicians use UT to measure wall thickness and inspect components without causing damage.",
        listTitle: "APPLICATIONS & STANDARDS",
        listItems: [
            "UT Thickness: Single or dual element transducers map remaining wall thickness due to corrosion or erosion.",
            "Shear Wave UT: Angle-beam testing detects and sizes internal defects, crack propagation, and weld anomalies.",
            "Highly repeatable, reliable testing results on base metals, welds, castings, and forgings.",
            "ASNT Level II TC-1A certified technicians operating in ditch."
        ]
    },
    paut: {
        title: "PHASED ARRAY UT (PAUT)",
        image: "assets/images/tirusa/axseam.png",
        body: "Phased Array Ultrasonic Testing uses advanced multi-element probes and electronic time delays to create beams that steer and focus. This produces high-resolution cross-sectional views of internal pipeline structures at rapid speeds.",
        listTitle: "ADVANCED PAUT SCANNING EQUIPMENT",
        listItems: [
            "HydroFORM Scanner: 2-axis encoding system enabling immersion-tank quality wall-thickness mapping and midwall damage detection in minimal time.",
            "FlexoFORM Scanner: Specifically designed with flexible arrays to scan the outer curvature of pipe elbows and bends.",
            "AxSEAM Long Seam Scanner: configured with 4 individual PA probes enabling PA, TOFD, and TFM long seam inspections."
        ]
    },
    laser: {
        title: "CREAFORM LASER SCANNING",
        image: "assets/images/tirusa/creaform_scan.jpg",
        body: "Creaform is a state-of-the-art laser scanning system providing external anomaly mapping on pipelines. The system creates highly accurate 3D models of pipeline defects instantaneously in the field.",
        listTitle: "ADVANTAGES & APPLICATIONS",
        listItems: [
            "High Accuracy: Captures 3D details up to 50 microns.",
            "Unmatched Speed: Up to 80 times faster data acquisition than manual pit depth gauging.",
            "Proprietary Pipecheck Software: Instantly sizes corrosion, dents, mechanical damage, or complex gouges inside dents.",
            "Generates immediate repair or pressure-derating reports for direct engineering decisions."
        ]
    },
    pig: {
        title: "PIG TRACKING & ANALYSIS",
        image: "assets/images/tirusa/agm_jeep.jpg",
        body: "TIR provides full-scale, 24-hour tracking services for pigging projects, including pipeline cleaning, batching, gauging, purging, and inline inspection (ILI) runs.",
        listTitle: "SYSTEM CAPABILITIES",
        listItems: [
            "Field Tracking: Utilizes geophones, transmitters, receivers, and GPS logging units.",
            "Locator Services: GPS mapping of stuck, lost, or stalled inline tools.",
            "AGM Passage Surveys: Captures precise time of tool passage to calibrate ILI mapping logs.",
            "Remote Pig Tracking: Sends automated passage alerts (text and email) directly to pipeline controllers."
        ]
    },
    gis: {
        title: "GIS MAPPING & SURVEY",
        image: "assets/images/tirusa/trimble_gps.jpg",
        body: "Data collection is vital for pipeline lifecycle management. TIR surveyors use advanced Trimble GPS hardware to capture critical location metrics in the field to format and integrate into operator databases.",
        listTitle: "SURVEY SERVICES",
        listItems: [
            "Above Ground Marker (AGM) surveys at sub-meter, sub-decimeter, or sub-centimeter accuracies.",
            "As-Built surveys for newly installed or repaired pipeline segments.",
            "As-Is surveys to fill GIS gaps (documenting meter runs, valves, traps, hazards).",
            "Pipeline depth of cover and GPS centerline mapping to analyze structural strain.",
            "GIS file formatting supporting industry standards (PODS and ESRI)."
        ]
    },
    ecda: {
        title: "EXTERNAL CORROSION DIRECT ASSESSMENT (ECDA)",
        image: "assets/images/tirusa/soil_resistivity.jpg",
        body: "External Corrosion Direct Assessment (ECDA) is a proactive, four-step continuous improvement process designed to identify and address corrosion hotspots before they compromise pipeline integrity.",
        listTitle: "ECDA STAGES",
        listItems: [
            "1. Pre-Assessment: Historic data search and feasibility analysis.",
            "2. Indirect Inspections: Aboveground surveys (CIS, DCVG, ACVG) mapping electrical currents.",
            "3. Direct Examination: Targeted maintenance digs to inspect and size corrosion anomalies.",
            "4. Post-Assessment: Calculating remaining strength, reassessment intervals, and mitigation steps."
        ]
    },
    rt: {
        title: "RADIOGRAPHIC TESTING (RT)",
        image: "assets/images/tirusa/xray_seam_weld.jpeg",
        body: "Radiographic Testing uses X-rays or gamma rays (Iridium-192, Selenium-75, Cobalt-60) to peer inside pipeline welds to identify internal discontinuities without cutting the pipe.",
        listTitle: "RADIOGRAPHY CAPABILITIES",
        listItems: [
            "Conventional Film RT: Legacy radiography where radiation exposes physical film, developed in field darkrooms.",
            "Computed Radiography (CR): A bridge system using reusable phosphor plates captured digitally via scanners.",
            "Digital Radiography (DR): Uses flat panel arrays displaying weld images instantaneously on computers in the field.",
            "Film Digitizing: Scanning old weld films into digital databases to archive and transmit records electronically."
        ]
    },
    mpi: {
        title: "MAGNETIC PARTICLE INSPECTION (MPI)",
        image: "assets/images/tirusa/mpi_ditch.jpeg",
        body: "Magnetic Particle Inspection (MPI) detects surface and near-surface cracks and defects in ferromagnetic materials by applying a magnetic field and highlighting magnetic flux leaks.",
        listTitle: "MPI METHODOLOGY",
        listItems: [
            "Yoke Magnetization: Electromagnetic yokes introduce magnetic fields into localized weld areas.",
            "Magnetic Particles: Wet fluorescent or dry color-contrast particles highlight stress cracks, hook cracks, or seam defects.",
            "Technicians analyze resulting indications to determine compliance with ASME, API, or AWS codes.",
            "Essential service for verifying pipeline seam integrity inside excavation ditches."
        ]
    }
};
