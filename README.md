
# LinkedIn Job Scraper

This project is a Python-based LinkedIn job scraper using Selenium. The scraper navigates LinkedIn's job search pages, collects data on job postings, and saves the information to a CSV file for further analysis.

## Features

- **Job Details Extraction**: Collects job title, company name, location, job type (Remote/Hybrid/On-site), seniority level, posted time, number of applicants, number of employees, industry, job posting URL, and job description.
- **Pagination Handling**: Automatically navigates through multiple pages of job listings.
- **CSV Export**: Saves the collected data into a CSV file for easy access and analysis.
- **Dynamic URL and Job ID Extraction**: Extracts the current job's URL and job ID dynamically from the browser.

## Requirements

- Python 3.x
- Selenium
- WebDriver Manager

## Setup

1. **Clone the repository:**
   ```
   git clone https://github.com/yourusername/linkedin-job-scraper.git
   cd linkedin-job-scraper
   ```

2. **Install the required packages:**
   ```
   pip install -r requirements.txt
   ```

## Usage

1. **Configure the Search Query:**
   Open `main.py` and set your desired keywords and location in the `query` dictionary:
   ```python
   query = {
       'keywords': 'Data Analyst',
       'location': 'European Union'
   }
   ```

2. **Run the Scraper:**
   Execute `main.py` to start scraping:
   ```
   python main.py
   ```

3. **Output:**
   The script will save the job data into `linkedin_jobs.csv` in the project directory.

## Structure

- **`scraper.py`**: Contains the `Search` class, which implements all the scraping logic.
- **`main.py`**: The main script to configure and run the scraper.

## Notes

- Make sure you have a stable internet connection, as the scraper needs to load multiple pages.
- The script currently works with LinkedIn's job search interface. If LinkedIn updates its layout or structure, the scraper may need adjustments.
- Respect LinkedIn's terms of service and use this tool responsibly. Excessive scraping may lead to IP blocking or account issues.

## Contributing

Feel free to submit pull requests or open issues to improve the scraper.

## License

This project is licensed under the MIT License.

---
