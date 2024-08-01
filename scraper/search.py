import time
from datetime import datetime, timedelta
import urllib.parse
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException, NoSuchElementException
import sys
import os
import csv
import re

# Include the parent directory in sys.path to access LinkedIn class
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from scraper.LinkedIn import LinkedIn

print("Search module imported")

class Search(LinkedIn):
    """
    The Search class inherits from the LinkedIn class and is used to perform
    job searches on LinkedIn based on provided search queries.
    """

    RESULTS_CLASS = 'jobs-search-results-list'
    PAGE_BUTTON_CLASS = 'artdeco-pagination__indicator'
    LINK_CLASS = 'job-card-list__title'
    NEXT_BUTTON_XPATH = './/button[contains(@class, "artdeco-button--icon-right") and contains(@class, "jobs-search-pagination__button--next")]'
    JOB_LIST_CONTAINER = '#main > div > div.scaffold-layout__list-detail-inner.scaffold-layout__list-detail-inner--grow > div.scaffold-layout__list > div'

    def __init__(self, query):
        """
        Initialize the Search class with a search query.

        Parameters:
        query (dict): A dictionary containing search keywords and location.
        """
        super().__init__()
        self.keywords = query['keywords']
        self.location = query['location']
        self.page_number = 1
        self.search()

    def search(self):
        """
        Execute a job search on LinkedIn using the provided keywords and location,
        and go to the specified page of search results.
        """
        url = ('https://www.linkedin.com/jobs/search/?refresh=true' +
            '&keywords=' + urllib.parse.quote(self.keywords) +
            '&location=' + urllib.parse.quote(self.location) +
            '&start=' + str((self.page_number - 1) * 25))
        print(f"Navigating to URL: {url}")
        self.go_to(url)

    def scroll_to_bottom(self):
        """
        Scroll to the bottom of the job list container to ensure all search
        results are loaded.
        """
        print("Scrolling to the bottom of the job list container to load all results...")
        job_list_container = self.webpage.find_element(By.CSS_SELECTOR, self.JOB_LIST_CONTAINER)
        last_height = self.webpage.execute_script("return arguments[0].scrollHeight", job_list_container)
        while True:
            self.webpage.execute_script("arguments[0].scrollTo(0, arguments[0].scrollHeight);", job_list_container)
            time.sleep(2)  # Wait for new data to load
            new_height = self.webpage.execute_script("return arguments[0].scrollHeight", job_list_container)
            if new_height == last_height:
                break
            last_height = new_height
        print("Scrolled to the bottom of the job list container.")

    def page_range(self):
        """
        Return a range object representing all the page numbers in the search results.

        Returns:
        range: A range object representing all the page numbers.
        """
        self.scroll_to_bottom()
        buttons = self.webpage.find_elements(By.CLASS_NAME, self.PAGE_BUTTON_CLASS)
        page_numbers = [int(button.text) for button in buttons if button.text.isdigit()]
        page_count = max(page_numbers) if page_numbers else 1
        print(f"Found {page_count} pages.")
        return range(1, page_count + 1)

    def go_to_page(self, new_page_number):
        """
        Go to a specific page of the search results.

        Parameters:
        new_page_number (int): The number of the page to go to.
        """
        if new_page_number != self.page_number:
            print(f"Changing to page {new_page_number}")
            self.page_number = new_page_number
            self.search()

    def get_urls(self):
        """
        Extract the URLs of all job postings on the current search results page.

        Returns:
        list: A list of job posting URLs.
        """
        anchors = self.webpage.find_elements(By.CLASS_NAME, self.LINK_CLASS)
        urls = [self.remove_query(a) for a in anchors]
        print(f"Extracted {len(urls)} job URLs.")
        return urls

    @staticmethod
    def remove_query(a):
        """
        Remove the query string from a job posting URL.

        Parameters:
        a (WebElement): A WebElement representing a link to a job posting.

        Returns:
        str: The job posting URL without the query string.
        """
        url = a.get_attribute('href')
        url_without_query_string = url.split('?')[0]
        return url_without_query_string

    def extract_job_data(self):
        """
        Extract job data from the current search results page.
        """
        job_data = []
        job_elements = self.webpage.find_elements(By.CLASS_NAME, 'job-card-container')
        if not job_elements:
            print("No job elements found on this page.")
            return job_data

        for job_element in job_elements:
            try:
                # Extract job title
                title_element = job_element.find_element(By.CSS_SELECTOR, '.job-card-list__title')
                title = title_element.text if title_element else "N/A"
                
                # Extract company name
                company_element = job_element.find_element(By.CSS_SELECTOR, '.job-card-container__primary-description')
                company = company_element.text if company_element else "N/A"
                
                # Extract location
                location_element = job_element.find_element(By.CSS_SELECTOR, '.job-card-container__metadata-item')
                location_text = location_element.text if location_element else "N/A"
                
                # Split location into city and country
                city = "N/A"
                country = "N/A"
                if location_text != "N/A":
                    location_parts = location_text.split(',')
                    if len(location_parts) >= 2:
                        city = location_parts[0].strip()
                        country = location_parts[-1].split('(')[0].strip()  # Remove mode (e.g., On-site)
                    elif len(location_parts) == 1:
                        city = location_parts[0].strip()
                
                # Extract additional metadata, such as "Remote" or "Hybrid" status
                remote_elements = job_element.find_elements(By.CSS_SELECTOR, 'span[aria-hidden="true"]')
                remote = "On-site"
                if any("Remote" in elem.text for elem in remote_elements):
                    remote = "Remote"
                elif any("Hybrid" in elem.text for elem in remote_elements):
                    remote = "Hybrid"

                # Click on the job title to go to the job detail page
                job_element.click()
                time.sleep(4)  # Wait for the page to load

                # Extract job posting URL and Job ID
                job_posting_url = self.webpage.current_url
                job_id = job_posting_url.split('currentJobId=')[-1].split('&')[0] if 'currentJobId=' in job_posting_url else "N/A"
                
                # Extract Job Description from the detail page
                try:
                    job_description_element = self.webpage.find_element(By.CSS_SELECTOR, '.jobs-description-content__text')
                    job_description = job_description_element.text if job_description_element else "N/A"
                except Exception as e:
                    job_description = "N/A"
                    print(f"Error extracting job description: {e} URL: {job_posting_url}")

                # Extract seniority level
                try:
                    seniority_element = self.webpage.find_element(By.XPATH, '//*[@id="main"]/div/div[2]/div[2]/div/div[2]/div/div[1]/div/div[1]/div/div[1]/div[1]/div[4]/ul/li[1]/span/span[3]')
                    seniority = seniority_element.text if seniority_element else "N/A"
                except Exception as e:
                    seniority = "N/A"
                    print(f"Error extracting seniority: {e} URL: {job_posting_url}")

                # Extract posted time
                try:
                    posted_time_element = self.webpage.find_element(By.XPATH, '//*[@id="main"]/div/div[2]/div[2]/div/div[2]/div/div[1]/div/div[1]/div/div[1]/div[1]/div[3]/div/span[3]')
                    posted_time = posted_time_element.text if posted_time_element else "N/A"
                except NoSuchElementException:
                    try:
                        posted_time_element = self.webpage.find_element(By.XPATH, '//*[@id="main"]/div/div[2]/div[2]/div/div[2]/div/div[1]/div/div[1]/div/div[1]/div[1]/div[3]/div/span[3]/span[2]')
                        posted_time = posted_time_element.text if posted_time_element else "N/A"
                    except Exception as e:
                        posted_time = "N/A"
                        print(f"Error extracting posted time: {e} URL: {job_posting_url}")

                # Parse and format posted time
                try:
                    if "hour" in posted_time or "hours" in posted_time:
                        posted_time_formatted = datetime.today().strftime('%Y-%m-%d')
                    elif "day" in posted_time or "days" in posted_time:
                        days_ago = int(re.search(r'\d+', posted_time).group())
                        posted_time_formatted = (datetime.today() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
                    elif "week" in posted_time or "weeks" in posted_time:
                        weeks_ago = int(re.search(r'\d+', posted_time).group())
                        posted_time_formatted = (datetime.today() - timedelta(weeks=weeks_ago)).strftime('%Y-%m-%d')
                    elif "month" in posted_time or "months" in posted_time:
                        months_ago = int(re.search(r'\d+', posted_time).group())
                        posted_time_formatted = (datetime.today() - timedelta(days=months_ago*30)).strftime('%Y-%m-%d')
                    else:
                        posted_time_formatted = "N/A"
                except Exception as e:
                    posted_time_formatted = "N/A"
                    print(f"Error formatting posted time: {e} URL: {job_posting_url}")

                # Extract number of applicants
                try:
                    applicants_element = self.webpage.find_element(By.XPATH, '//*[@id="main"]/div/div[2]/div[2]/div/div[2]/div/div[1]/div/div[1]/div/div[1]/div[1]/div[3]/div/span[5]')
                    applicants = applicants_element.text if applicants_element else "N/A"
                except Exception as e:
                    applicants = "N/A"
                    print(f"Error extracting number of applicants: {e} URL: {job_posting_url}")

                # Extract number of employees
                try:
                    employees_element = self.webpage.find_element(By.XPATH, '//*[@id="main"]/div/div[2]/div[2]/div/div[2]/div/div[1]/div/section/section/div[1]/div[2]/span[1]')
                    employees = employees_element.text if employees_element else "N/A"
                except Exception as e:
                    employees = "N/A"
                    print(f"Error extracting number of employees: {e} URL: {job_posting_url}")

                # Extract industry
                try:
                    industry_element = self.webpage.find_element(By.XPATH, '//*[@id="main"]/div/div[2]/div[2]/div/div[2]/div/div[1]/div/section/section/div[1]/div[2]')
                    industry_raw = industry_element.text if industry_element else "N/A"
                    # Extract the industry name using regular expressions
                    match = re.match(r"^[^\d]+", industry_raw)
                    if match:
                        industry = match.group().strip()
                    else:
                        industry = "N/A"
                except Exception as e:
                    industry = "N/A"
                    print(f"Error extracting industry: {e} URL: {job_posting_url}")

                # Today's date
                today_date = datetime.today().strftime('%Y-%m-%d')

                # Enclose the job description in quotes to handle commas and special characters
                job_description = job_description.replace('"', '""')  # Escape internal quotes
                job_description = f'"{job_description}"'
                
                # Append the collected data to the job_data list
                job_data.append([title, company, city, country, remote, seniority, posted_time_formatted, today_date, applicants, employees, industry, job_posting_url, job_id, job_description])
                print(f"Extracted job - Title: {title}, Company: {company}, City: {city}, Country: {country}, Type: {remote}, Seniority: {seniority}, Posted: {posted_time_formatted}, Collected Date: {today_date}, Applicants: {applicants}, Employees: {employees}, Industry: {industry}, Job URL: {job_posting_url}, Job ID: {job_id}, Job Description: {job_description}")

            except StaleElementReferenceException as e:
                print(f"Stale element reference: {e}. Skipping this job element.")
            except Exception as e:
                print(f"Error extracting job data: {e}")
                # Additional debugging or logging can be implemented here

        return job_data

    def click_next_page(self):
        """
        Click the 'Next' button to go to the next page of job results.
        """
        try:
            next_button = WebDriverWait(self.webpage, 10).until(
                EC.presence_of_element_located((By.XPATH, self.NEXT_BUTTON_XPATH))
            )
            self.webpage.execute_script("arguments[0].scrollIntoView();", next_button)
            time.sleep(0.2)
            next_button.click()
            time.sleep(3)  # Adjust this sleep time as needed for page to load
            print("Clicked 'Next' button.")
        except NoSuchElementException:
            print("No 'Next' button found. End of job listings or failed to load.")
            return False
        return True

    def save_to_csv(self, job_data, filename='linkedin_jobs.csv', append=False):
        """
        Save job data to a CSV file.

        Parameters:
        job_data (list): A list of job data.
        filename (str): The filename to save the data.
        append (bool): Whether to append to the file (default is False, which overwrites the file).
        """
        mode = 'a' if append else 'w'
        header = not os.path.exists(filename) or not append
        with open(filename, mode, newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            if header:
                writer.writerow(['Title', 'Company', 'City', 'Country', 'Type', 'Seniority', 'Posted', 'Collected Date', 'Applicants', 'Employees', 'Industry', 'Job URL', 'Job ID', 'Job Description'])
            writer.writerows(job_data)
        print(f"Jobs data saved to {filename}.")

if __name__ == "__main__":
    # Define your search query here
    query = {
        'keywords': 'Data Analyst',
        'location': 'European Union'
    }

    # Create an instance of the Search class and start the job search
    search = Search(query)

    try:
        # Iterate through all pages and extract job data
        all_job_data = []
        while True:
            search.scroll_to_bottom()  # Scroll to load all jobs
            job_data = search.extract_job_data()
            all_job_data.extend(job_data)
            search.save_to_csv(job_data, append=True)  # Save data after each page
            if not search.click_next_page():  # Try clicking 'Next', if fails break the loop
                break
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        search.save_to_csv(all_job_data, append=True)  # Final save
        search.close()
