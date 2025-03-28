
   $(document).ready(function() {

//initialization
   $("#loadsidebar").load("includes/sidebar.html");

        // Function to format numbers with commas
        const formatNumber = (num) => {
            if (num == null || isNaN(num)) return "0.00"; // Handle null, undefined, or NaN
            return Number(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

   // function getCookie(name) {
   //  let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
   //  return match ? match[2] : null;
   //  }

   //  var token = getCookie("authToken");
            function getAuthData() {
                let token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
                let expiry = localStorage.getItem("authExpiry") || sessionStorage.getItem("authExpiry");
                return { token, expiry };
            }
            var getAuthReturn =  getAuthData();
            var token = getAuthReturn.token;  

////////////////////////////////////////// For Schedule  //////////////////////////////////////////
////////////////////////////////////////// For Schedule  //////////////////////////////////////////
////////////////////////////////////////// For Schedule  //////////////////////////////////////////
////////////////////////////////////////// For Schedule //////////////////////////////////////////   

    let requestschedule= [];
    let table = ""; // Declare table globally
    let options = ""; // Declare options globally

// Fetch Unit List for Dropdown
requestschedule.push(
    $.ajax({
        url: "https://smcgphtrading.sanmiguel.com.ph/TradingAPIV2/mobile/GetUnitPerRegionCurrent",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (response) {
            for (const region in response) {
                response[region].forEach(unit => {
                    if (!unit.UnitNumber.endsWith("_BAT")) { // Exclude "_BAT" units
                        options += `<option value="${unit.UnitNumber}">${unit.UnitNumber}</option>`;
                    }
                });
            }
            // Populate the select dropdown after data is fetched
            $("#unitSelect").html(options);
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        },
    })
);

// Function to fetch data and create the table
let unitDataRequest;
let priceDataRequest;
let getHap;
let getDap;
function rtdUnitNumber(unitnumber_input) {
    table = `
    <table class="table table-bordered">
        <thead>
            <tr>
            <th>INT.</th>
            <th>PRICE.</th>
            <th>SCHED.</th>
            <th>ACTL.</th>
            </tr>
        </thead>
    <tbody>`; // Reset table
     unitDataRequest = $.ajax({
        url: "https://smcgphtrading.sanmiguel.com.ph/TradingAPIV2/Trading/RTD?UnitNumber=" + unitnumber_input,
        type: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

     priceDataRequest = $.ajax({
        url: "https://smcgphtrading.sanmiguel.com.ph/TradingAPIV2/Trading/Price?UnitNumber=" + unitnumber_input,
        type: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

     getHap = $.ajax({
        url: "https://smcgphtrading.sanmiguel.com.ph/TradingAPIV2/Trading/GetUnitHAP?UnitNumber=" + unitnumber_input,
        type: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

     getDap = $.ajax({
        url: "https://smcgphtrading.sanmiguel.com.ph/TradingAPIV2/Trading/GetUnitDAP?UnitNumber=" + unitnumber_input,
        type: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    });


    // Push requests into the requestschedule array
    requestschedule.push(unitDataRequest, priceDataRequest , getHap , getDap);

}

                // destroy instance to reset
                let dataChartHap = null;
                // destroy instance to reset
                let dataChartDap = null;

                let setSelectedItem = localStorage.getItem("setSelectedItem"); // Get expiry from localStorage
                
                
                if (setSelectedItem) {
                            console.log("Value Selected "+setSelectedItem);
                            rtdUnitNumber(setSelectedItem);
                            $("#unitSelect").val(setSelectedItem).trigger("change"); // Set and trigger change event
                            LoaderData();
                }

    function LoaderData(){
            // Use $.when to wait for both AJAX calls to complete
            $.when(unitDataRequest,priceDataRequest,getDap,getHap).done(function (unitResponse, priceResponse , getHapResponse , getDapResponse) {
                if (!unitResponse[0] || unitResponse[0].length === 0) {
                    console.error("No data received from RTD API.");
                    return;
                }

                let priceData = priceResponse[0]; // Extract price data

                // Loop through RTD data and add a new column for price
                unitResponse[0].forEach(item => {
                    let price = priceData.find(p => p.Timestamp === item.Timestamp)?.Value || "N/A"; // Match price with timestamp
                    let actual = priceData.find(p => p.Timestamp === item.Timestamp)?.Actual || "N/A"; // Match price with timestamp

                    table += `<tr>
                                <td>${item.TimestampLabel}</td>                                
                                <td>${formatNumber(price)}</td> <!-- Add Price Column -->
                                <td>${formatNumber(item.Value)}</td>
                                <td>${actual}</td>
                              </tr>`;
                });

                table += `</tbody></table>`;

                 const labelsHap = getHapResponse[0].map(item => item.TimestampLabel);
                 const valuesHap = getHapResponse[0].map(item => item.Value);
                         
                    // for hap chart 

                    // Get canvas element
                    let ctxHap = null;
                    ctxHap = document.getElementById('myChartHap').getContext('2d');
        
                    // ✅ Destroy existing chart instance before creating a new one
                    if (dataChartHap !== null) {
                        dataChartHap.destroy();
                    }

                     dataChartHap = new Chart(ctxHap, {
                        type: 'line',  // Line chart
                        data: {
                            labels: labelsHap,  // X-axis
                            datasets: [{
                                label: 'Value',
                                data: valuesHap,  // Y-axis
                                borderColor: 'blue',
                                backgroundColor: 'rgba(0, 0, 255, 0.3)', // Semi-transparent fill
                                borderWidth: 2,
                                pointRadius: 4,
                                pointBackgroundColor: 'blue',
                                tension: 0.3, // Smooth curve
                                fill: true // Enables the fill effect
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false, // Helps with responsiveness
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'TimestampLabel',
                                        font: { size: 14 }
                                    }
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Value',
                                        font: { size: 14 }
                                    },
                                    beginAtZero: false
                                }
                            },
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'top'
                                }
                            }
                        }
                    });


                 const labelsDap = getDapResponse[0].map(item => item.TimestampLabel);
                 const valuesDap = getDapResponse[0].map(item => item.Value);
                         
                    // for DAP chart 

                         // Get canvas element
                    let ctxDap = null;
                    ctxDap=document.getElementById('myChartDap').getContext('2d');


        
                    // ✅ Destroy existing chart instance before creating a new one
                    if (dataChartDap !== null) {
                        dataChartDap.destroy();
                    }


                     dataChartDap = new Chart(ctxDap, {
                        type: 'line',  // Line chart
                        data: {
                            labels: labelsDap,  // X-axis
                            datasets: [{
                                label: 'Value',
                                data: valuesDap,  // Y-axis
                                borderColor: 'blue',
                                backgroundColor: 'rgba(0, 0, 255, 0.3)', // Semi-transparent fill
                                borderWidth: 2,
                                pointRadius: 4,
                                pointBackgroundColor: 'blue',
                                tension: 0.3, // Smooth curve
                                fill: true // Enables the fill effect
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false, // Helps with responsiveness
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'TimestampLabel',
                                        font: { size: 14 }
                                    }
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Value',
                                        font: { size: 14 }
                                    },
                                    beginAtZero: false
                                }
                            },
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'top'
                                }
                            }
                        }
                    });




                // Insert table into the page after both requests are done
                $("#data-table").html(table);
            }).fail(function (xhr, status, error) {
                console.error("Error fetching data:", error);
            });
    }
    // Validate if select option changes
    $("#unitSelect").change(function () 
    {
        let selectedValue = $(this).val(); // Get selected value
        rtdUnitNumber(selectedValue);
        localStorage.setItem("setSelectedItem", selectedValue);
        LoaderData();
    });


////////////////////////////////////////// For Demand //////////////////////////////////////////
////////////////////////////////////////// For Demand //////////////////////////////////////////
////////////////////////////////////////// For Demand //////////////////////////////////////////
////////////////////////////////////////// For Demand //////////////////////////////////////////

let requestsdemand=[];
let resultdemand="";
let jsonDataGraph=[];
function getCurrentTotal(data) {
    let totalPH = 0;
    let values = {
        Luz: 0,
        Vis: 0,
        Min: 0,
        PH: 0
    };

    let table_demand="";
    table_demand = '<table class="table table-bordered">';
    // Find the "Current" entry
    let currentEntry = data.find(entry => entry.Description === "Current");

    if (currentEntry && currentEntry.PIValue) {
        currentEntry.PIValue.forEach(item => {
            if (item.UnitNumber === "Luz") {
                values.Luz = item.Value;
            } else if (item.UnitNumber === "Vis") {
                values.Vis = item.Value;
            } else if (item.UnitNumber === "Min") {
                values.Min = item.Value;
                  
            }
        });

        // Compute PH (sum of Luz, Vis, and Min)
        values.PH = values.Luz + values.Vis + values.Min;

                table_demand+="<tr><th>PH</th><th>"+formatNumber(values.PH)+"</th></tr>";
                table_demand+="<tr><th>LUZ</th><th>"+formatNumber(values.Luz)+"</th></tr>";      
                table_demand+="<tr><th>VIS</th><th>"+formatNumber(values.Vis)+"</th></tr>";                      
                table_demand+="<tr><th>MIN</th><th>"+formatNumber(values.Min)+"</th></tr>";
        table_demand+="</table>";    

                }

    return table_demand;
}

// Fetch Unit List for Demand Summary
requestsdemand.push(
    $.ajax({
        url: "https://smcgphtrading.sanmiguel.com.ph/TradingAPIV2/Trading/GetDemand",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (response) {
            resultdemand = getCurrentTotal(response);
    
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        },
    })
);

// Fetch Data for Graph
requestsdemand.push(
    $.ajax({
        url: "https://smcgphtrading.sanmiguel.com.ph/TradingAPIV2/Trading/GetDemand",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (response) {
            jsonDataGraph = (response);
    
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        },
    })
);


$.when.apply($, requestsdemand).done(function () {
                $("#demand-table").html(resultdemand);




                  let labels = [];
                    let luzData = [];
                    let visData = [];
                    let minData = [];

                    jsonDataGraph.forEach(item => {
                        if (item.Description === "Luz" || item.Description === "Vis" || item.Description === "Min") {
                            item.PIValue.forEach(point => {
                                if (!labels.includes(point.TimestampLabel)) {
                                    labels.push(point.TimestampLabel);
                                }
                                if (item.Description === "Luz") luzData.push(point.Value);
                                if (item.Description === "Vis") visData.push(point.Value);
                                if (item.Description === "Min") minData.push(point.Value);
                            });
                        }
                    });

                    // Sort labels numerically if they are numbers
                    labels.sort((a, b) => a - b);

                //console.log(labels);
        let ctx = document.getElementById('myChart00').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { 
                        label: 'Luz', 
                        data: luzData, 
                        borderColor: 'blue', 
                        backgroundColor: 'rgba(0, 0, 255, 0.2)', 
                        fill: true 
                    },
                    { 
                        label: 'Vis', 
                        data: visData, 
                        borderColor: 'red', 
                        backgroundColor: 'rgba(255, 0, 0, 0.2)', 
                        fill: true 
                    },
                    { 
                        label: 'Min', 
                        data: minData, 
                        borderColor: 'green', 
                        backgroundColor: 'rgba(0, 255, 0, 0.2)', 
                        fill: true 
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'nearest', intersect: false },
                scales: {
                    x: { title: { display: true, text: 'Timestamp Label' } },
                    y: { title: { display: true, text: 'Value' } }
                },
                plugins: {
                    zoom: {
                        pan: { enabled: true, mode: 'x' },
                        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }
                    }
                }
            }
        });





});

// For Demand //





});