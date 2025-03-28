
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




////////////////////////////////////////// For Demand //////////////////////////////////////////
////////////////////////////////////////// For Demand //////////////////////////////////////////
////////////////////////////////////////// For Demand //////////////////////////////////////////
////////////////////////////////////////// For Demand //////////////////////////////////////////

let timestampLabel = "";
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
            jsonDataGraph = (response);
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        },
    })
);
requestsdemand.push(
  $.ajax({
        url: "https://smcgphtrading.sanmiguel.com.ph/TradingAPIV2/mobile/GetUnitPerRegionCurrent",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (response) {

            // Extract first valid timestamp
            for (const region in response) {
                if (response[region].length > 0) {
                    timestampLabel = response[region][0].TimestampLabel;
                    break;
                }
            }


        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        },
    })
);


$.when.apply($, requestsdemand).done(function () {
                $("#demand-table").html(resultdemand);
                $("#intervalstring").text(timestampLabel);
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


/// SUMMARY TOTAL SCHED AND ACTUAL


    let requestsSummary = [];
    requestsSummary.push(
            $.ajax({
                url: "https://smcgphtrading.sanmiguel.com.ph/TradingAPIV2/mobile/GetUnitPerRegionPrevious",
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

    $.when.apply($, requestsSummary).done(function () {


    function calculateTotal(region) {
        let totalRTD = 0;
        let totalActual = 0;

        if (jsonDataGraph[region]) {
            $.each(jsonDataGraph[region], function (index, item) {
                totalRTD += item.RTD;
                totalActual += item.Actual;
            });
        }

        return { totalRTD, totalActual };
    }


        let luzTotal = calculateTotal("Luz");
        let visTotal = calculateTotal("Vis");
        let minTotal = calculateTotal("Min");
        let total_schedgen=0;
        total_schedgen=luzTotal.totalRTD+visTotal.totalRTD+minTotal.totalRTD;

        let table_demandtotalschedgen="";
        table_demandtotalschedgen = '<table class="table table-bordered">';
                table_demandtotalschedgen+="<tr><th>PH</th><th>"+formatNumber(total_schedgen)+"</th></tr>";
                table_demandtotalschedgen+="<tr><th>LUZ</th><th>"+formatNumber(luzTotal.totalRTD)+"</th></tr>";      
                table_demandtotalschedgen+="<tr><th>VIS</th><th>"+formatNumber(visTotal.totalRTD)+"</th></tr>";                      
                table_demandtotalschedgen+="<tr><th>MIN</th><th>"+formatNumber(minTotal.totalRTD)+"</th></tr>";
        table_demandtotalschedgen+="</table>";    


        // load total sched gen 
        $("#demand-tabletotalsched").html(table_demandtotalschedgen);


        // compute avg gen
        let total_avggen=0;
        total_avggen=luzTotal.totalActual+visTotal.totalActual+minTotal.totalActual;

        let table_actualgen="";
        table_actualgen = '<table class="table table-bordered">';
                table_actualgen+="<tr><th>PH</th><th>"+formatNumber(total_avggen)+"</th></tr>";
                table_actualgen+="<tr><th>LUZ</th><th>"+formatNumber(luzTotal.totalActual)+"</th></tr>";      
                table_actualgen+="<tr><th>VIS</th><th>"+formatNumber(visTotal.totalActual)+"</th></tr>";                      
                table_actualgen+="<tr><th>MIN</th><th>"+formatNumber(minTotal.totalActual)+"</th></tr>";
        table_actualgen+="</table>";


        // load total sched gen 
        $("#demand-tableactualgen").html(table_actualgen);



        function loadTable(region) {
            let data = jsonDataGraph[region];

           let table_portfolio="";
           table_portfolio = '<table class="table table-bordered table-striped">';
           table_portfolio += '<thead"><th>Unit</th><th>MW</th><th>ACTL</th><th>%</th><th>LMP</th></thead><tbody> <tr><td colspan="6"><h3>'+region+'</h3></td></tr>';
            if (!data || data.length === 0) {
                table_portfolio += `
                    <tr>
                        <td colspan="6" style="text-align:center; font-size:15px; color:red; font-weight:bold;">
                            No data available
                        </td>
                    </tr>
                `;
            } else {
                $.each(data, function(index, item) {
                    table_portfolio += `
                        <tr>
                            <td style="color:green;">${item.UnitNumber}</td>
                            <td>${item.RTD}</td>
                            <td>${item.Actual !== null ? formatNumber(item.Actual.toFixed(2)) : "N/A"}</td>
                            <td>${item.Percentage !== null ? formatNumber(item.Percentage.toFixed(2)) + "%" : "N/A"}</td>
                            <td>${item.Price !== null ? formatNumber(item.Price.toFixed(2)) : "N/A"}</td>
                        </tr>
                        <tr>
                            <td colspan="6"><label> Remarks : </label> ${item.Remarks || "No remarks available"} </td>
                        </tr>
                    `;
                });
            }
                        table_portfolio+="</table>";
        
           $("#portfolio-table").append(table_portfolio);
        }

        loadTable("Luz");
        loadTable("Vis");
        loadTable("Min");
    });



});

// For Demand //





});