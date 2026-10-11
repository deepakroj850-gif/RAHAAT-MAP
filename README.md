🌍 RAAHAT AI — Navigate Smarter. Travel Safer.

Climate-aware route comparison for smarter, safer, and more environmentally conscious travel.

RAAHAT AI is a web-based navigation project designed to help users compare routes using travel time, available environmental information, and reported road hazards. It explores how navigation can go beyond speed by helping users understand potential risks and environmental conditions before choosing a route.

«Note: RAAHAT AI is an experimental decision-support prototype, not a certified safety system. Environmental data coverage varies, and routes or risk scores must not be treated as guarantees of road safety.»

---

📌 Table of Contents

- "Problem Statement" (#-problem-statement)
- "Our Solution" (#-our-solution)
- "Features" (#-features)
- "Technology Stack" (#-technology-stack)
- "System Architecture" (#-system-architecture)
- "How It Works" (#-how-it-works)
- "Getting Started" (#-getting-started)
- "Demo Mode" (#-demo-mode)
- "AWS Cloud Architecture" (#-aws-cloud-architecture)
- "Project Structure" (#-project-structure)
- "Data Sources" (#-data-sources)
- "Limitations" (#-limitations)
- "Future Enhancements" (#-future-enhancements)
- "Learning Outcomes" (#-learning-outcomes)
- "Contributing" (#-contributing)
- "License" (#-license)

---

🚨 Problem Statement

Traditional navigation focuses heavily on travel time and distance. However, the fastest route may not always be the best choice when environmental conditions or road hazards are involved.

Travellers may encounter:

- Heavy rainfall and potential waterlogging.
- Poor air-quality conditions.
- Unexpected road hazards or reported incidents.
- Incomplete or outdated information about travel conditions.

There is an opportunity to combine route information with environmental context to help people make more informed travel decisions.

💡 Our Solution

RAAHAT AI combines interactive mapping, route calculation, available environmental data, and route-risk evaluation in a single web application.

The project explores three route recommendation modes:

Mode| Objective
⚡ Fastest Route| Prioritise travel time.
🛡️ Safety-Focused Route| Prioritise available hazard and environmental risk information.
⚖️ Balanced Route| Consider travel time and available risk information together.

The objective is to make route trade-offs easier to understand rather than relying on travel time alone.

✨ Features

- Interactive Map: Explore locations and routes using Leaflet and OpenStreetMap.
- Location Search: Find places using geocoding.
- Route Calculation: Calculate driving routes through OSRM.
- Environmental Dashboard: Display available weather and air-quality information.
- Route Comparison: Compare travel alternatives using the application's recommendation logic.
- Risk Scoring: Evaluate available risk factors using application-level scoring logic.
- Community Hazard Reporting: Record hazard reports locally in the browser.
- Demo Mode: Demonstrate application workflows using deterministic sample data when external services are unavailable.
- Missing-Data Disclosure: Identify when important information, such as live flood alerts, is unavailable.
- API Failure Handling: Support demonstration and testing when external services cannot be reached.

Feature availability depends on the current implementation, configured APIs, and data coverage.

🛠️ Technology Stack

Frontend

Technology| Purpose
HTML5| Web page structure
CSS3| Styling and responsive layout
Vanilla JavaScript| Application logic, API requests, and route comparison
Leaflet.js| Interactive map rendering
OpenStreetMap| Map data and visualisation

APIs and Data Sources

Service| Purpose
Nominatim| Location search and geocoding
OSRM| Driving-route calculation
Open-Meteo Weather API| Weather information and forecasts
Open-Meteo Air Quality API| Air-quality information

Current Storage

- Browser "localStorage" for community hazard reports, as implemented in the prototype.
- External APIs for supported mapping, routing, weather, and air-quality information.

Planned Cloud Technologies

- Amazon S3
- Amazon CloudFront
- Amazon API Gateway
- AWS Lambda
- Amazon DynamoDB
- Amazon EventBridge
- Amazon SageMaker AI for a possible future machine-learning phase

AWS status: These are proposed architectural components unless they have been separately deployed and verified. They are not required to run the current frontend prototype.

---

🏗️ System Architecture

Current Prototype Architecture

The current application is frontend-oriented and runs in the browser.

                 USER
                   |
                   v
        RAAHAT AI Web Application
          HTML + CSS + JavaScript
                   |
          +--------+---------+
          |        |         |
          v        v         v
       Nominatim  OSRM    Open-Meteo
       Geocoding  Routes  Weather & AQI
          |        |         |
          +--------+---------+
                   |
                   v
          Route Comparison
          and Risk Evaluation
                   |
                   v
           Results on the Map

Community hazard reports are stored in browser local storage. They are not automatically shared with other users.

Proposed AWS Architecture

                 USER
                   |
                   v
           Amazon CloudFront
                   |
                   v
             Amazon S3
          Static Web Hosting
                   |
                   v
        Amazon API Gateway
                   |
                   v
              AWS Lambda
          Backend Processing
                   |
             +-----+------+
             |            |
             v            v
        DynamoDB     External APIs
      Hazard Reports  Weather / Routes
             |
             v
       Route-Risk Results

Additional services could support scheduled jobs through EventBridge and future predictive modelling through SageMaker AI.

This architecture is a design direction for future development, not a claim that all services are currently operational.

⚙️ How It Works

1. Location Selection: The user enters a starting point and destination.
2. Geocoding: The application uses a location-search service to resolve place information.
3. Route Calculation: OSRM calculates available driving routes.
4. Environmental Context: The application retrieves supported weather and air-quality information when available.
5. Risk Evaluation: The implemented application logic evaluates available route and environmental factors.
6. Route Comparison: The user compares alternatives according to travel-time and risk-related priorities.
7. Hazard Reporting: Users can record supported hazard reports in the browser.
8. Result Presentation: The application displays route information, environmental context, and relevant data limitations.

The quality of the result depends on the availability, accuracy, and freshness of its input data.

---

🚀 Getting Started

Prerequisites

You will need:

- A modern web browser.
- Python 3 installed, or another local static HTTP server.
- Internet access for external map tiles and API requests.

1. Clone the Repository

git clone <YOUR_GITHUB_REPOSITORY_URL>

Replace the placeholder with your repository's actual URL.

2. Open the Project Folder

cd <YOUR_PROJECT_FOLDER>

Replace the placeholder with the actual folder name.

3. Start a Local Server

Run:

python -m http.server 8000

If your system uses "python3", run:

python3 -m http.server 8000

4. Open the Application

Visit:

http://localhost:8000

If your main HTML file is in a subfolder, navigate to that folder's URL.

5. Test the Application

- Search for a starting location and destination.
- Generate available routes.
- Compare route recommendations.
- Inspect the environmental dashboard.
- Test demo mode.
- Check how the application communicates missing data or API failures.

No frontend build step is required for the described Vanilla JavaScript setup.

---

🧪 Demo Mode

RAAHAT AI includes a demo mode to support predictable demonstrations and testing when external services are unavailable.

Demo mode uses deterministic sample values rather than verified live measurements.

The application should clearly display a warning such as:

«DEMO DATA — NOT FOR REAL-WORLD SAFETY DECISIONS.»

Demo results must not be presented as current weather observations, actual flood alerts, or verified road conditions.

When external APIs fail, users should be informed whether the displayed information is simulated, unavailable, forecast-based, or obtained from a live source.

---

☁️ AWS Cloud Architecture

AWS can help evolve RAAHAT AI from a browser-based prototype into a cloud-backed application.

AWS Service| Proposed Responsibility
Amazon S3| Store and host static frontend files
Amazon CloudFront| Deliver static assets through a content delivery network
Amazon API Gateway| Expose backend endpoints
AWS Lambda| Run backend logic and calculate route-risk scores
Amazon DynamoDB| Store shared community hazard reports
Amazon EventBridge| Trigger scheduled processing and refresh jobs
Amazon SageMaker AI| Explore validated predictive models in a future phase

Example Cloud Workflow

1. A user submits a route request through the web application.
2. API Gateway forwards the request to a backend function.
3. Lambda processes the request and obtains the required supported data.
4. DynamoDB stores or retrieves community hazard reports.
5. The backend returns route-comparison information to the frontend.
6. The application displays the results and their data limitations.

Cloud Deployment Goals

- Centralised hazard reporting.
- Improved separation between frontend and backend.
- Secure API access and input validation.
- Better monitoring and error handling.
- Scalable data storage.
- A foundation for future predictive analytics.

Actual deployment requires configuring AWS resources, permissions, environment settings, monitoring, and appropriate security controls.

---

📡 Data Sources

Source| Use| Documentation
OpenStreetMap| Map data| "OpenStreetMap" (https://www.openstreetmap.org/)
Leaflet| Interactive maps| "Leaflet" (https://leafletjs.com/)
Nominatim| Geocoding| "Nominatim" (https://nominatim.openstreetmap.org/)
OSRM| Route calculation| "OSRM Documentation" (https://project-osrm.org/docs/)
Open-Meteo| Weather data| "Weather API" (https://open-meteo.com/en/docs)
Open-Meteo| Air-quality data| "Air Quality API" (https://open-meteo.com/en/docs/air-quality-api)

Please review the terms, attribution requirements, and usage policies of each service before deployment.

For example, the public Nominatim service has a usage policy that includes a maximum request rate of one request per second and restrictions on autocomplete use. Production deployments should follow the current policy and consider an appropriate provider if usage grows.

OpenStreetMap data and map tiles have separate attribution and usage considerations. See the "OpenStreetMap copyright and attribution page" (https://www.openstreetmap.org/copyright).

---

⚠️ Limitations

RAAHAT AI is an experimental prototype with important limitations:

- Flood information: A live flood-alert provider is not configured by default. Flood risk cannot be verified when appropriate data is unavailable.
- Traffic information: Real-time traffic data depends on an external provider and is not guaranteed by the current architecture.
- Community reports: Reports stored in local storage are limited to the current browser and device.
- Risk scores: Scores are estimates based on implemented logic and available inputs, not certified safety assessments.
- Environmental coverage: Weather and air-quality information may be forecast-based or model-derived and may not represent conditions on every road segment.
- API availability: External services may be unavailable, rate-limited, or subject to usage restrictions.
- Machine learning: No trained predictive model should be assumed unless it has been implemented and validated.
- Cloud deployment: AWS services listed as planned are not part of the running system unless separately deployed.

Always follow official weather warnings, road closures, and instructions from local authorities. Do not rely on this prototype to make emergency or safety-critical travel decisions.

---

🔮 Future Enhancements

- [ ] Deploy the frontend using Amazon S3 and CloudFront.
- [ ] Add secure backend endpoints using API Gateway and Lambda.
- [ ] Replace browser-only hazard storage with DynamoDB.
- [ ] Integrate a reliable flood or waterlogging data source.
- [ ] Investigate real-time traffic data from a suitable provider.
- [ ] Improve route scoring with documented, validated weighting.
- [ ] Add data freshness and confidence indicators.
- [ ] Explore historical weather and incident datasets for predictive modelling.
- [ ] Introduce notifications for verified hazards.
- [ ] Improve accessibility and mobile usability.
- [ ] Add automated tests and backend monitoring.
- [ ] Evaluate the application's behaviour using realistic route and hazard scenarios.

---

📚 Learning Outcomes

Through this project, we are exploring:

- Frontend development with HTML, CSS, and JavaScript.
- Interactive maps and geospatial applications.
- Integration with external APIs.
- Route comparison and risk-scoring logic.
- Error handling and deterministic demo workflows.
- Responsible communication of incomplete data.
- AWS serverless architecture and cloud deployment.
- The challenges of building reliable, scalable applications.

---

🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit your changes with a clear message.
5. Open a pull request describing the improvement.

For changes involving risk scoring or hazard handling, explain how the change affects the results and how it was tested.

📄 License

No license has been specified yet.

Before making the repository public for reuse, choose a license that reflects how you want others to use, modify, and distribute your work. For example, the MIT License is a common option for open-source software, but select it only if it fits your intentions.

---

👥 Project Information

Project: RAAHAT AI
Tagline: Navigate Smarter. Travel Safer.
Category: Climate-Aware Navigation / Environmental Intelligence
Current Platform: Web Application
Development Focus: Mapping, route comparison, environmental data, and cloud architecture

Built as a learning and innovation project exploring how navigation can become more environmentally aware and transparent about travel risks.

If you find this project interesting, consider starring the repository ⭐ and sharing feedback or ideas for future improvements
