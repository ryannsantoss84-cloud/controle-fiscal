from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = browser.new_page()
    page.goto("http://127.0.0.1:4173/calendar")
    page.screenshot(path="verification_calendar.png")
    page.goto("http://127.0.0.1:4173/taxes")
    page.screenshot(path="verification_taxes.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
