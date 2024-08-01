from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import logging
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import sys
import os

# Include the parent directory in sys.path to locate config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config import EMAIL, PASSWORD

logging.basicConfig(level=logging.INFO)

class LinkedIn:
    EMAIL = EMAIL
    PASSWORD = PASSWORD
    SIGN_IN_BUTTON_XPATH = '//button[@type="submit"]'

    # Use WebDriver Manager to handle the ChromeDriver installation
    options = Options()
    options.binary_location = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    # options.add_argument('--headless')  # Uncomment this to run in headless mode

    service = Service(ChromeDriverManager().install())
    webpage = webdriver.Chrome(service=service, options=options)

    rate_limit = None

    def __init__(self, requests_per_minute=1):
        if LinkedIn.rate_limit is None:
            LinkedIn.rate_limit = 60 / requests_per_minute

    def go_to(self, url):
        LinkedIn.webpage.get(url)
        self.wait_for_page_to_load(url)
        time.sleep(self.rate_limit)

    def wait_for_page_to_load(self, url):
        wait = WebDriverWait(self.webpage, 20)
        try:
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'body')))
        except TimeoutException as e:
            logging.error(f"The page could not be loaded: {e}")
            self.go_to(url)

    def login(self, login):
        self.go_to('https://www.linkedin.com/login')
        try:
            page = LinkedIn.webpage
            page.find_element(By.ID, 'username').send_keys(login['email'])
            page.find_element(By.ID, 'password').send_keys(login['password'])
            page.find_element(By.XPATH, self.SIGN_IN_BUTTON_XPATH).click()
        except Exception as e:
            logging.error(f"An error occurred during login: {e}")

    def close(self):
        self.webpage.quit()
