
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

////////////////////////////////////////// For RTD / Remarks  //////////////////////////////////////////
////////////////////////////////////////// For RTD / Remarks  //////////////////////////////////////////
////////////////////////////////////////// For RTD / Remarks  //////////////////////////////////////////
////////////////////////////////////////// For RTD / Remarks //////////////////////////////////////////   

    //console.log("Generated Token "+token);
let requestsrtd = [];
let remarks_table = "";
let options = "";
let timestampLabel = "";
let UnitNumber = "";
let Price = "";
let jsonData=[];
// Fetch RTD data
requestsrtd.push(
    $.ajax({
        url: "https://smcgphtrading.sanmiguel.com.ph/TradingAPIV2/mobile/GetUnitPerRegionCurrent",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (response) {
            jsonData=response;

            // Extract first valid timestamp
            for (const region in response) {
                if (response[region].length > 0) {
                    Price = response[region][0].Price;
                    UnitNumber = response[region][0].UnitNumber;
                    timestampLabel = response[region][0].TimestampLabel;
                    break;
                }
            }

            let tableContainer = {};
            let regionHasData = { Luz: false, Vis: false, Min: false }; // Track if regions have data

            // Initialize containers for each region
            ["Luz", "Vis", "Min"].forEach(region => {
                tableContainer[region] = `
                                          <table class="table table-bordered">
                                              <thead class="table-th">
                                                  <tr>
                                                      <th style="width: 150px; text-align: center;">Unit Number</th>
                                                      <th style="width: 300px; text-align: center;">Remarks</th>
                                                  </tr>
                                                 
                                              </thead>
                                                  <tr><td colspan="2" class="text-center"><h5 >${region} Region</h5></td></tr>
                                              <tbody>`;
            });

            // Populate data
            for (const region in response) {
                response[region].forEach(unit => {
                    if (!unit.UnitNumber.endsWith("_BAT")) { // Exclude "_BAT" units
                        options += `<option value="${unit.UnitNumber}">${unit.UnitNumber}</option>`;
                        regionHasData[region] = true; // Mark region as having data

                        tableContainer[region] += `<tr>
                            <td style="width: 150px; text-align: center;">${unit.UnitNumber}</td>
                            <td style="width: 300px; text-align: center;">${unit.Remarks || "No Remarks"}</td>
                        </tr>`;
                    }
                });
            }

            // Ensure each region table is not empty
            ["Luz", "Vis", "Min"].forEach(region => {
                if (!regionHasData[region]) {
                    // Add "No Data Available" row if no data exists
                    tableContainer[region] += `<tr><td colspan="2" class="text-center">No Data Available</td></tr>`;
                }

                // Close the table and append to remarks_table
                tableContainer[region] += `</tbody></table>`;
                remarks_table += tableContainer[region];
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        },
    })
);


    $("#unitSelect").change(function () {

        let selectedUnitData = $(this).val();
        let foundData = null;

        // Search for the unit in all regions
        for (const region in jsonData) {
            foundData = jsonData[region].find(unit => unit.UnitNumber === selectedUnitData);
            if (foundData) break;
        }

        // Display the results
        if (foundData) {
            $("#nodename").text(foundData.UnitNumber);
            $("#currentinterval").text(formatNumber(foundData.Price));
            $("#avghour").text(formatNumber(foundData.Price));
            $("#intervalstring").text(foundData.TimestampLabel);
            
        } else {
            $("#nodename, #currentinterval, #avghour, #intervalstring, #remarks").text("Not Found");
        }
    });

$.when.apply($, requestsrtd).done(function () {
    $("#intervalstring").text(timestampLabel);
    $("#nodename").text(UnitNumber);
    $("#currentinterval").text(formatNumber(Price));
    $("#avghour").text(formatNumber(Price));

    // Update select list
    $("#unitSelect").html(options);
    // Load remarks tables dynamically
    $("#data-table").html(remarks_table);
            let tbody = $("#powerTableBody");
            tbody.empty();

        function loadTable(region) {
            let data = jsonData[region];
            let row="";

            row += `
                    <tr>
                        <td colspan="5"><h4>${region}</h4></td>
                    </tr>
                `;
            if (!data || data.length === 0) {
                // If the region has no data, show a message
                row +=`
                    <tr>
                        <td colspan="5" style="text-align:center; color:red; font-weight:bold;">
                            No data available for ${region}
                        </td>
                    </tr>
                `;
            }


            let groupedData = {};

            // Group RTD values and assign them to unit columns
            data.forEach(item => {
                let rtdKey = item.Price.toFixed(2); // Grouping by Price

                if (!groupedData[rtdKey]) {
                    groupedData[rtdKey] = { units: {}, price: item.Price, remarks: item.Remarks, time: item.TimestampLabel };
                }

                // Add unit and its corresponding RTD value
                let unitIndex = Object.keys(groupedData[rtdKey].units).length;
                if (unitIndex < 5) {
                    groupedData[rtdKey].units[item.UnitNumber] = item.RTD !== "" ? item.RTD : ""; // Blank if null
                }
            });

            // Build the table rows
            Object.keys(groupedData).forEach(priceKey => {
                let rowData = groupedData[priceKey];
                let unitColumns = ["", "", "", "", ""]; // Default blank

                Object.keys(rowData.units).forEach((unit, index) => {
                    if (index < 5) unitColumns[index] = rowData.units[unit];
                });

                row += `
                    <tr>
                        <td>${unitColumns.find(value => value !== "") || "0"}</td>
                        <td>${unitColumns[0] || ""}</td>
                        <td>${unitColumns[1] || ""}</td>
                        <td>${unitColumns[2] || ""}</td>
                        <td>${unitColumns[3] || ""}</td>
                    </tr>
                `;
              
            });

              tbody.append(row);
        }

        // Load default region (Luzon)
        loadTable("Luz");
        loadTable("Vis");
        loadTable("Min");
    })

////////////////////////////////////////// For Dap //////////////////////////////////////////
////////////////////////////////////////// For Dap //////////////////////////////////////////
////////////////////////////////////////// For Dap //////////////////////////////////////////
////////////////////////////////////////// For Dap //////////////////////////////////////////
    let dataSets = [];

    let requests = [];

    // Fetch DAP Price
    requests.push(
        $.ajax({
            url: "https://smcgphtrading.sanmiguel.com.ph/TradingAPIV2/Trading/GetAllUnitDAPprices",
            type: "GET",
            headers: { Authorization: "Bearer " + token },
            success: function (response) {
                let jsonResponse;
                try {
                    jsonResponse = typeof response === "string" ? JSON.parse(response) : response;
                } catch (error) {
                    console.error("❌ Error parsing JSON:", error, response);
                    return;
                }

                if (jsonResponse && jsonResponse[0].PIValue) {
                    dataSets[0] = jsonResponse[0].PIValue; // Store PIValue array
                } else {
                    console.error("❌ PIValue missing from DAPPrice response:", jsonResponse);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error fetching DAP Prices:", error);
            },
        })
    );

    // Fetch DAP
    requests.push(
        $.ajax({
            url: "https://smcgphtrading.sanmiguel.com.ph/TradingAPIV2/Trading/GetAllUnitDAP",
            type: "GET",
            headers: { Authorization: "Bearer " + token },
            success: function (response) {
                let jsonResponse;
                try {
                    jsonResponse = typeof response === "string" ? JSON.parse(response) : response;
                } catch (error) {
                    console.error("❌ Error parsing JSON:", error, response);
                    return;
                }

                if (jsonResponse && jsonResponse[0].PIValue) {
                    dataSets[1] = jsonResponse[0].PIValue; // Store PIValue array
                } else {
                    console.error("❌ PIValue missing from DAP response:", jsonResponse);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error fetching DAP:", error);
            },
        })
    );
// Wait for both requests to complete
$.when.apply($, requests).done(function () {
    if (!dataSets[0] || !dataSets[1]) {
        console.error("❌ Missing data, cannot generate chart.");
        return;
    }

    // Extract common timestamps
    let timestamps = dataSets[0].map(item => item.TimestampLabel); // Use first dataset as reference

    // Extract values
    let dapValues = dataSets[1].map(item => item.Value);
    let dapPriceValues = dataSets[0].map(item => item.Value);

    // Create Chart
    const ctx = document.getElementById("myChart00").getContext("2d");
    new Chart(ctx, {
        type: "bar", // Base type remains bar
        data: {
            labels: timestamps,
            datasets: [
                {
                    label: "DAP (Bar)",
                    data: dapValues,
                    type: "line", // Keeps DAP as a bar chart
                    backgroundColor: "rgba(255, 140, 0, 0.6)", // Semi-transparent orange
                    borderColor: "rgba(255, 140, 0, 1)", // Strong orange
                    borderWidth: 1,
                    fill: true,
                    barThickness: 20, // Adjust bar width
                },
                {
                    label: "DAP Price (Line)",
                    data: dapPriceValues,
                    type: "bar", // Keeps DAP Price as a line chart
                    borderColor: "rgba(0, 123, 255, 1)", // Strong blue
                    backgroundColor: "rgba(0, 123, 255, 0.2)", // Light blue fill
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4, // Smooth curve
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Mobile-friendly
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                    labels: {
                        color: "#000", // Black text for legend
                        font: { size: 14 },
                    },
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                    titleFont: { size: 16 },
                    bodyFont: { size: 14 },
                    backgroundColor: "rgba(0,0,0,0.8)",
                    padding: 10,
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Time (Hours)",
                        color: "#000", // Black text for title
                        font: { size: 14 },
                    },
                    grid: { display: false },
                    ticks: {
                        color: "#000", // Black text for labels
                        font: { size: 12 },
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Value",
                        color: "#000", // Black text for title
                        font: { size: 14 },
                    },
                    beginAtZero: true,
                    grid: {
                        color: "rgba(0,0,0,0.2)", // Light grid lines
                    },
                    ticks: {
                        color: "#000", // Black text for numbers
                        font: { size: 12 },
                    },
                },
            },
        },
    });
});


// For Dap //





});