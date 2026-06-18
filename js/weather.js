async function showWeather() {

    const city =
        document.getElementById("city").value;

    const result =
        document.getElementById("result");

    try {

        const response = await fetch(
            "https://wttr.in/" +
            city +
            "?format=j1"
        );

        const data =
            await response.json();

        const temp =
            data.current_condition[0].temp_C;

        const weather =
            data.current_condition[0]
            .weatherDesc[0].value;

        let forecastHTML = "";

        for (let i = 0; i < 3; i++) {

            const day =
                data.weather[i];

            const max =
                day.maxtempC;

            const min =
                day.mintempC;

            const forecastWeather =
                day.hourly[4]
                .weatherDesc[0].value;

            let icon = "☀️";

            if (
                forecastWeather
                .toLowerCase()
                .includes("rain")
            ) {
                icon = "🌧️";
            }

            if (
                forecastWeather
                .toLowerCase()
                .includes("cloud")
            ) {
                icon = "☁️";
            }

            forecastHTML += `
                <div class="weather-card">
                    <h3>${i + 1}日後</h3>
                    <p style="font-size:30px">${icon}</p>
                    <p>${forecastWeather}</p>
                    <p>${max}℃ / ${min}℃</p>
                </div>
            `;
        }

        result.innerHTML =
            city + "<br>" +
            weather + "<br>" +
            temp + "℃";

        document.getElementById("forecast")
            .innerHTML = forecastHTML;

    } catch(error) {

        result.innerHTML =
            "天気情報を取得できませんでした";

    }

}