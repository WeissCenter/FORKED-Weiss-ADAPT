# Deploying ADAPT Admin using GitHub Actions

The easiest way to deploy the ADAPT Admin application is to fork this repository and add a workflow to your forked repository from the sample workflow file provided in `/res/example-admin-deploy.yml`. Copy this file to the `.github/workflows/` folder in your project and rename it if you wish.

First, you will need to create AWS access keys to be used by the workflow in GitHub. See instructions [here](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey) to complete this step.

Next, create repository secrets using the AWS credentials generated in the prior step. These secrets must be named `AWS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` exactly to work with the workflow. Instructions can be found [here](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository).

Finally, update the `BUCKET` and `CF_DISTRIBUTION` environment variables in the workflow `.yml` file you copied in the first step to use the AWS S3 bucket name and CloudFront distribution ID that were created when you deployed the ADAPT Amazon Web Services project to your AWS environment.

Commit and push your changes to the `main` branch in your repository. This push will trigger a GitHub action that will deploy the ADAPT Admin application to your AWS environment.
