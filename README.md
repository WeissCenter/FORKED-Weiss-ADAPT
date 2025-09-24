![ADAPT Logo](/res/ADAPT_Logo.png 'Accessible Data Analysis and Publishing Tool')

# Accessible Data Analysis and Publishing Tool (ADAPT)

The Rhonda Weiss Center for Accessible IDEA Data, or the Weiss Center, is a technical assistance data center under the Office of Special Education Programs at the U.S. Department of Education (Department).

Under the Individuals with Disabilities Education Act (IDEA), Sections 616 and 618, states are required to collect and analyze data on infants, toddlers, and children with disabilities and report on the data to the Department and the public. Currently, states struggle to report data in accessible formats that are also dynamic and usable by data consumers with disabilities or limited statistical knowledge. 

ADAPT is a web-based tool that helps make IDEA data easier to understand and interpret. It supports IDEA Sections 616 and 618 data, Part B and Part C.

Benefits of ADAPT include:

- Meet and exceed 508 compliance accessibility requirements now, and in the future, as ADAPT will be updated to meet any changes. We strive for WCAG 2.2 AAA compliance.
- Meet IDEA federal reporting requirements now, and in the future, as ADAPT will be updated to meet any changes.

## Features

ADAPT has two key components, ADAPT Admin and ADAPT Viewer.

- ADAPT Admin – State users can define the data sources, define the data views and load the data, develop and publish accessible reports, and configure the tool to meet the State’s specific requirements.
- ADAPT Viewer – Public users can view accessible reports that have been published by the State. They can interact with the report by applying filters based on various dimensions (e.g., demographics such as race, ethnicity, child age, gender, etc.).

The key features of ADAPT Admin include:

- Data views – upload IDEA Part B and Part C files. The following data collections are currently supported:
  - 618 Part B Child count and education environments (FS002, FS089) – 2023-2024 (CSV file formats)
  - 618 Part C Child count and settings – 2023-2024 (HTML file format)
- Report templates – predefined accessible report templates (in JSON format) for the data collections defined above.
- Reports – create and publish accessible reports based on predefined report templates.
- Tool settings – adjust settings to manage how ADAPT behaves, including:
  - Data sources – create connection to CEDS Data Warehouse as Microsoft SQL Server data source.
  - Data suppression – define n-size to protect data privacy.
  - Footer links – manage links to display in the ADAPT footer.
  - Security – define security settings for session timeouts.
  - User management – control who has access to ADAPT Admin and assign their role.
- Accessibility settings – allow users to tailor their experience by adjusting the text size, color contrast, and content density. This component is compatible with screen readers, braille displays, and other assistive devices.

## Roadmap

ADAPT plan to add the following features in future releases:

- Additional IDEA 616 and 618 Parts B and C data collections in the future:
  - 618 Part B
    - Assessment (2025 Q3)
    - Personnel (2025 Q3)
    - Discipline (2025 Q3)
    - Exiting (2025 Q3)
    - Dispute resolution (2026 Q3)
    - MOE Reduction and CEIS (2026 Q4)
  - 618 Part C
    - Dispute resolution (2026 Q3)
    - Exiting (2026 Q3)
  - 616 Part B and C – SPP/APR (2025 Q4)
- Language options for ADAPT Viewer (2025 Q2)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

ADAPT consists of two front-end Angular applications, and a back-end application that runs in Amazon Web Services (AWS). This repository contains the code and instructions for the front-end applications. Please see the [Weiss AWS Web Services](https://github.com/WeissCenter/Weiss-AWS-Web-Services) repository for instructions for installing and running the back-end application.

Weiss ADAPT uses the [Nx](https://nx.dev/) build system to manage, build, and deploy the ADAPT Admin and ADAPT Viewer Angular applications.

### Prerequisites

Before you begin, perform the following steps.

1. Ensure you have Node.js installed (version 18.x or later). You can download it from [nodejs.org](https://nodejs.org/).
2. Make sure you have npm (comes with Node.js) installed to manage dependencies.
3. Nx CLI is required for managing and running the mono repo. Install it globally:

```sh
npm install -g nx
```

Verify the installation by checking the version:

```sh
nx --version
```

4. Install the Angular CLI globally. This will help you manage the Angular projects within the Nx workspace:

```sh
npm install -g @angular/cli
```

Verify the Angular CLI installation by checking the version:

```sh
ng --version
```

5. It is recommended to use an IDE or text editor with support for TypeScript and Angular, such as [Visual Studio Code](https://code.visualstudio.com/).
6. Deploy your back-end application to AWS by following the instructions for [Weiss AWS Web Services](https://github.com/WeissCenter/Weiss-AWS-Web-Services).
7. (Optional) Install Git for version control. Git can be downloaded from [git-scm.com](https://git-scm.com/).

Once you have completed step #7, obtain the following properties from your AWS environment:

- API_URL (URL of the API Gateway for your AWS deployment)
- VAPID_KEY
- cognitoRegion (The AWS region in which your back-end services are deployed)
- cognitoDomainName
- callbackUrl
- userPoolId
- userPoolClientId
- s3PublicAssetsDomainName
- clientId
- appDomain

### Installation

Begin by cloning or downloading the code from this repository to your local development environment.

Open the local environment files `apps/adapt-admin/src/environments/environment.ts` and `apps/adapt-viewer/src/environments/environment.ts` and enter the values from step #7 in the prior section in their respective fields.

To run the ADAPT Admin application locally, follow these steps.

1. Setup your Nx workspace by running:

```sh
npx nx connect
```

2. Install all Node dependencies:

```sh
npm i
```

3. Run ADAPT Admin locally by running:

```sh
npx nx serve adapt-admin
```

4. Confirm the application is running in your browser at: `http://localhost:4200`

To run the ADAPT Viewer application locally, follow these steps.

1. If you have not done so already, setup your Nx workspace by running:

```sh
npx nx connect
```

2. Install all Node dependencies:

```sh
npm i
```

3. Run ADAPT Admin locally by running:

```sh
npx nx serve adapt-viewer
```

4. Confirm the application is running in your browser at: `http://localhost:4200`

## Deployment

To deploy the ADAPT Admin application you will first need to complete the deployment of the [Weiss AWS Web Services](https://github.com/WeissCenter/Weiss-AWS-Web-Services) project to your AWS account. Once that is complete, you may proceed to deploy the ADAPT Admin project by following the steps below.

1. Deploy using GitHub Actions by following the instructions found in [this](/docs/ADAPT_Admin_AWS_Deployment_GitHub.md) document.

### Built With

- [United States Web Design System (USWDS)](https://designsystem.digital.gov/) – library of UI components to create accessible, mobile-friendly websites
- [Angular](https://angular.dev/) – single-page web application framework
- [Python](https://www.python.org/) – programming language
- [Nx](https://nx.dev/) – development toolkit to help manage mono repos
- [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/) – framework for defining cloud infrastructure in code and provisioning it through AWS CloudFormation

## Contributing

Please read [CONTRIBUTING.md](/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This content was produced under U.S. Department of Education, Office of Special Education Programs, Award No. H373Q220002. Project Officer, Eric Caruso. The views expressed herein do not necessarily represent the positions or policies of the U.S. Department of Education. No official endorsement by the U.S. Department of Education of any product, commodity, service, or enterprise mentioned in this website is intended or should be inferred.

## Acknowledgments

ADAPT is developed by [AEM Corporation](https://www.aemcorp.com/) under the Weiss Center.
