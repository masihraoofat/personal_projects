from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def setup_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage') 
    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(60)
    return driver, WebDriverWait(driver, 10)

USERNAME = input("\n\nenter your simon username and press ENTER:\n")
PASSWORD = input('\nenter your simon password and press ENTER:\n')

def login(driver, wait, username, password):
    driver.get('https://simon.studentworks.com/users/sign_in')
    username_field = wait.until(EC.presence_of_element_located((By.ID, 'user_email')))
    password_field = wait.until(EC.presence_of_element_located((By.ID, 'user_password')))
    username_field.send_keys(username)
    password_field.send_keys(password)
    password_field.submit()
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'navbar-brand')))

def combine_urls(base_url, path):
    return base_url.rstrip('/') + path

def extract_marketers(driver, wait, base_url, page_url):
    driver.get(page_url)
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    table = soup.find("table", {"class": "table table-bordered table-striped"})
    return [combine_urls(base_url, row.find("a").get("href")) for row in table.find_all("tr") if row.find("a")]

def fetch_marketer_data(driver, wait, marketer_url, base_url):
    driver.get(marketer_url)
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'table-condensed')))
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    
    marketer_name = soup.find('h1').get_text(strip=True)
    client_table = soup.find('table', class_='table-condensed')

    marketer_stats = {'leads': 0, 'estimates': 0, 'jobs_booked': 0}
    counted_estimates = set()
    counted_jobs = set()

    if client_table:
        client_names = client_table.find_all('a', href=lambda href: href and '/clients/' in href)
        marketer_stats['leads'] = len(client_names)

        for client in client_names:
            client_url = combine_urls(base_url, client.get('href'))
            driver.get(client_url)
            wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'form-control')))
            client_soup = BeautifulSoup(driver.page_source, 'html.parser')

            # Count estimates
            estimate_links = client_soup.find_all('a', href=lambda href: href and '/estimates/' in href)
            for _ in estimate_links:
                if client_url not in counted_estimates:
                    marketer_stats['estimates'] += 1
                    counted_estimates.add(client_url)

            # Count jobs booked
            job_links = client_soup.find_all('a', href=lambda href: href and '/financials' in href)
            if job_links:
                if client_url not in counted_jobs:
                    marketer_stats['jobs_booked'] += 1
                    counted_jobs.add(client_url)

    return marketer_name, marketer_stats

def calculate_ratios(marketer_data):
    ratios = {}
    for marketer_name, data in marketer_data.items():
        leads = data['leads']
        estimates = data['estimates']
        jobs_booked = data['jobs_booked']

        ratios[marketer_name] = {
            'Leads': leads,
            'Estimates': estimates,
            'Jobs Booked': jobs_booked,
            'Lead to Estimate Ratio (%)': (estimates / leads) * 100 if leads else 0,
            'Jobs to Lead Ratio (%)': (jobs_booked / leads) * 100 if leads else 0
        }
    return ratios

def print_ratios_table(ratios):
    print("{:<20} {:<15} {:<20} {:<20} {:<30} {:<30}".format(
        'Marketer', 'Leads', 'Estimates', 'Jobs Booked', 'Lead to Estimate Ratio (%)', 'Jobs to Lead Ratio (%)'))
    for marketer_name, data in ratios.items():
        print("{:<20} {:<15} {:<20} {:<20} {:<30} {:<30}".format(
            marketer_name, data['Leads'], data['Estimates'], data['Jobs Booked'], 
            data['Lead to Estimate Ratio (%)'], data['Jobs to Lead Ratio (%)']))

# Main Script
driver, wait = setup_driver()
base_url = "https://simon.studentworks.com/"
marketer_data = {}

try:
    login(driver, wait, USERNAME, PASSWORD)

    # Marketers
    marketer_urls = extract_marketers(driver, wait, base_url, f'{base_url}painting_positions/31593/my_team/marketers')
    for marketer_url in marketer_urls:
        marketer_name, stats = fetch_marketer_data(driver, wait, marketer_url, base_url)
        marketer_data[marketer_name] = stats

    # Sales Reps
    sales_rep_urls = extract_marketers(driver, wait, base_url, f'{base_url}painting_positions/31593/my_team/sales_reps')
    for sales_rep_url in sales_rep_urls:
        marketer_name, stats = fetch_marketer_data(driver, wait, sales_rep_url, base_url)
        marketer_data[marketer_name] = stats

    ratios = calculate_ratios(marketer_data)
    print_ratios_table(ratios)

except Exception as e:
    print("An error occurred:", e)
finally:
    driver.quit()