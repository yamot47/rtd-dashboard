    $(document).ready(function () {
            function updateDateTime() {
                var now = new Date();
                
                // Month names array
                var monthNames = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];

                // Day suffix function (1st, 2nd, 3rd, etc.)
                function getDayWithSuffix(day) {
                    if (day > 3 && day < 21) return day + "th";
                    switch (day % 10) {
                        case 1: return day + "st";
                        case 2: return day + "nd";
                        case 3: return day + "rd";
                        default: return day + "th";
                    }
                }

                var month = monthNames[now.getMonth()]; // Get month name
                var day = getDayWithSuffix(now.getDate()); // Get day with suffix
                var year = now.getFullYear();

                // Format time (HH:MM:SS)
                var hours = now.getHours().toString().padStart(2, '0');
                var minutes = now.getMinutes().toString().padStart(2, '0');
                var seconds = now.getSeconds().toString().padStart(2, '0');

                var dateString = month + " " + day + ", " + year; // Example: March 26th, 2025
                var timeString = hours + ":" + minutes + ":" + seconds;
                var dateTimeString = dateString + " " + timeString;

                $("#datetime_realtime").text(dateTimeString);
            }

            updateDateTime(); // Initial call
            setInterval(updateDateTime, 1000); // Update every second


            /// FOR CHECKING TOKEN EXPIRES
           // function getCookie(name) {
           //  let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
           //  return match ? match[2] : null;
           //  }

            function getAuthData() {
                let token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
                let expiry = localStorage.getItem("authExpiry") || sessionStorage.getItem("authExpiry");
                return { token, expiry };
            }
            var getAuthReturn =  getAuthData();
            var token = getAuthReturn.token;

            function clearAuthAndRedirect() {
                // Clear localStorage
                localStorage.removeItem("authToken");
                localStorage.removeItem("authExpiry");

                // Redirect to login page
                window.location.href = "index.html"; // Change this to your actual login URL
            }

            function isTokenExpired() {
               let expiryTime = localStorage.getItem("authExpiry") || sessionStorage.getItem("authExpiry");

                if (!expiryTime) {
                    console.error("No expiry time found, assuming token is expired.");
                    return true;
                }

                return Date.now() >= parseInt(expiryTime);
            }

            // Check if token is expired
            // Get stored token and expiry
            if (!token || $.trim(token) === "") { 
                // If token is missing or empty, log out
                console.warn("No token found, redirecting to login.");
                clearAuthAndRedirect();
            } else if (isTokenExpired()) {
                console.warn("Token expired, clearing storage and redirecting.");
                clearAuthAndRedirect();
            } 

            // for account info

            let requestUserInfo=[];
            requestUserInfo.push(
                $.ajax({
                    url: "https://smcgphtrading.sanmiguel.com.ph/TradingAPIV2/UserManagement/GetCurrentUserInfoWithPermission",
                    type: "GET",
                    headers: { Authorization: "Bearer " + token },
                    success: function (response) {
                            //console.log(response);
                            if(response.UserName!==""){ $("#sidebarPersonName").text(response.UserName); }
                    },
                    error: function (xhr, status, error) {
                        console.error("Error fetching DAP:", error);
                    },
                })
            );

            $.when.apply($, requestUserInfo).done(function () {
              
            });

            $(document).on('click','#btnlogout',function(){

                clearAuthAndRedirect();
            });

        });