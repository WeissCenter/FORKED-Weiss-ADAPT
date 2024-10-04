Feature: Home Page
    @mobile
    @loggedin
    Scenario: Check the mobile home page
        Then I should see the home page
    
    @tablet
    @loggedin
    Scenario: Check the tablet home page
        Then I should see the home page

    @desktop
    @loggedin
    Scenario: Check the desktop home page
        Then I should see the home page