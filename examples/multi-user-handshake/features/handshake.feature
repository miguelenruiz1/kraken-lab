Feature: Multi-user handshake
  Two browsers coordinate via the Kraken file-based signaling protocol. User 1
  opens Google and signals readiness; user 2 waits for the signal, then opens
  example.com. Shows the multi-device capability that single-user frameworks
  (Playwright, Cypress) cannot express natively.


  @user1 @web
  Scenario: User 1 opens Google and signals readiness
    Given I wait
    When I navigate to page "https://www.google.com"
    Then I send a signal to user 2 containing "user1-ready"


  @user2 @web
  Scenario: User 2 waits for user 1 then opens example.com
    Given I wait for a signal containing "user1-ready" for 60 seconds
    When I navigate to page "https://example.com"
