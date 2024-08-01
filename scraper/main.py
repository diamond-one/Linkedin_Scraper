import time
import sys
import os
# Include the parent directory in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from scraper.LinkedIn import LinkedIn
from search import LinkedInSearcher

if __name__ == "__main__":
    job_title = "Data Scientist"  # Specify the job title
    
    # Create LinkedIn and LinkedInSearcher instances
    linkedin = LinkedIn(requests_per_minute=20)
    searcher = LinkedInSearcher(linkedin)

    try:
        print("Please log in to LinkedIn manually. The script will continue in 30 seconds...")
        time.sleep(30)  # Pause for 30 seconds to allow manual login

        searcher.search_job(job_title)
        searcher.extract_jobs()
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        linkedin.close()
