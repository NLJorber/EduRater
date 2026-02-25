<a id="readme-top"></a>


<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/NLJorber">
        <img src="https://img.shields.io/badge/NLJorber-GitHub-blue" alt="NLJorber GitHub" />
      </a>
      <br />
      <a href="https://www.linkedin.com/in/natalie-j-66b587392/">
        <img src="https://img.shields.io/badge/LinkedIn-Profile-black?style=for-the-badge&logo=linkedin&colorB=555" alt="Natalie LinkedIn" />
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/SamR2406">
        <img src="https://img.shields.io/badge/SamR2406-GitHub-blue" alt="SamR2406 GitHub" />
      </a>
      <br />
      <a href="https://www.linkedin.com/in/samuel-reale-b4aaa0187/">
        <img src="https://img.shields.io/badge/LinkedIn-Profile-black?style=for-the-badge&logo=linkedin&colorB=555" alt="Samuel LinkedIn" />
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/jonahkingcs">
        <img src="https://img.shields.io/badge/jonahkingcs-GitHub-blue" alt="jonahkingcs GitHub" />
      </a>
      <br />
      <a href="https://www.linkedin.com/in/jonah-king-06489538a/">
        <img src="https://img.shields.io/badge/LinkedIn-Profile-black?style=for-the-badge&logo=linkedin&colorB=555" alt="Jonah LinkedIn" />
      </a>
    </td>
  </tr>
</table>


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/NLJorber/EduRater">
    <img src="public/icons/EduiconPale.png" alt="Logo" width="100" height="100">
  </a>

<h3 align="center">Edurater</h3>

  <p align="center">
    The Edurater app lets parents, teachers and childcare professionals create and view personalised reviews for registered education providers across the UK
    <br />
    <a href="https://github.com/NLJorber/EduRater"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/NLJorber/EduRater">View Demo</a>
    &middot;
    <a href="https://github.com/NLJorber/EduRater/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/NLJorber/EduRater/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>


<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>

- [About The Project](#about-the-project)
  - [Built With](#built-with)
- [Features](#features)
  - [Data Sources](#data-sources)
  - [Ratings Methodology](#ratings-methodology)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Disclaimer](#disclaimer)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

</details>


<!-- ABOUT THE PROJECT -->
## About The Project

EduRater is a web application that allows parents, teachers, and childcare professionals to create and view structured reviews of registered education providers across the UK.

The platform aggregates community-submitted reviews and presents them alongside mapped school data, enabling users to search, filter, and explore schools by name, location, and distance. Reviews are broken down into multiple categories to provide a more detailed and transparent view of school performance.

EduRater is intended as a supplementary research tool and does not replace official inspections or professional advice.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Built With

-Next.js
-React
-Supabase (database and authentication)
-Leaflet (interactive mapping)
-Brevo (contact form management)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Features

Aggregate reviews from users with direct experience of a school

Search and filter schools by:
Name
Location / postcode
Distance range

Reviews organised into 7 scored categories for detailed breakdowns

Overall school ratings calculated from all submitted reviews

Verified teacher accounts with access to school-level review analytics

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Data Sources

-Community-submitted reviews
-Leaflet map API
-UK government school datasets
-School data is user-generated and maintained locally via Supabase.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Ratings Methodology

Ratings are calculated on a 0.5 increment scale
Each review consists of 7 individually scored categories
A school’s overall rating is derived from the aggregate of all reviews submitted for that school

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

Node.js
npm

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/NLJorber/EduRater.git
   ```
2. Install NPM packages
   ```sh
   npm install   
   ```
3. Configure environment variables
   ```sh
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   BREVO_API_KEY=
   BREVO_TO_EMAIL=
   ```
4. Set up Supabase
   ```sh
   -Create a Supabase project
   -Generate your own schools database using UK government data
   -Source data from: https://explore-education-statistics.service.gov.uk/find-statistics
   -Note: dataset URLs may change over time, always use the latest available version
   ```
5. Configure Leaflet
   ```sh
   Connect Leaflet to your Supabase schools dataset for map rendering
   ```
6. Configure Brevo
   ```sh
   Create a Brevo contact form
   Link it to your desired contact email address
   ```
7. Run the development server
   ```sh
   npm run dev
   ```
<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Usage

Search for school by name, location, postcode or distance
View aggregated ratings and detailed category scores
Read and submit reviews based on personal experience

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Disclaimer

EduRater does not verify or endorse individual reviews.
The application should not be used as the sole basis for educational or professional decision-making.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- ROADMAP -->
## Roadmap

- [ ] Teacher-level reviews
- [ ] Expanded school statistics on all profiles
- [ ] Side-by-side school comparisons
- [ ] International school support
- [ ] Community Q&A functionality for schools

See the [open issues](https://github.com/NLJorber/EduRater/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/your-feature-name`)
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request
Contributions are welcome and appreciated.
<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the project_license. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTACT -->
## Contact

Natalie/Sam/Jonah - edurate@proton.me

Project Link: [https://github.com/NLJorber/EduRater](https://github.com/NLJorber/EduRater)
<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/NLJorber/EduRater.svg?style=for-the-badge
[contributors-url]: https://github.com/NLJorber/EduRater/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/NLJorber/EduRater.svg?style=for-the-badge
[forks-url]: https://github.com/NLJorber/EduRater/network/members
[stars-shield]: https://img.shields.io/github/stars/NLJorber/EduRater.svg?style=for-the-badge
[stars-url]: https://github.com/NLJorber/EduRater/stargazers
[issues-shield]: https://img.shields.io/github/issues/NLJorber/EduRater.svg?style=for-the-badge
[issues-url]: https://github.com/NLJorber/EduRater/issues
[license-shield]: https://img.shields.io/github/license/NLJorber/EduRater.svg?style=for-the-badge
[license-url]: https://github.com/NLJorber/EduRater/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/natalie-j-66b587392/
[product-screenshot]: images/screenshot.png
<!-- Shields.io badges. You can a comprehensive list with many more badges at: https://github.com/inttter/md-badges -->
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Supabase]: https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=fff
[Supabase-url]: https://supabase.com/
