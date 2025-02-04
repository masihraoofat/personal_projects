import subprocess
import sys

# Determine the correct pip command
pip_cmd = "pip3" if sys.platform.startswith("darwin") or sys.platform.startswith("linux") else "pip"

# Install Selenium and BeautifulSoup4
subprocess.run(f"{pip_cmd} install selenium beautifulsoup4", shell=True)

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import re


USERNAME = input('\n\nenter your simon username and press ENTER:\n')
PASSWORD = input('\nenter your simon password and press ENTER:\n')

#input validation
CLIENT_STATUS = input("\nenter 'booked', 'rejected' or 'pending' depending on which past clients you want, then press ENTER:\n").capitalize()
ALLOWED_STATUS = ["Booked","Rejected","Pending"]
while (CLIENT_STATUS not in ALLOWED_STATUS):
    CLIENT_STATUS = input("you can only choose between 'booked', 'rejected' and 'pending' ")

options = webdriver.ChromeOptions()
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
driver = webdriver.Chrome(options=options)
driver.set_page_load_timeout(60)
wait = WebDriverWait(driver, 10)

driver.get('https://simon.studentworks.com/users/sign_in')


# Log in
username_field = wait.until(EC.presence_of_element_located((By.ID, 'user_email')))
password_field = wait.until(EC.presence_of_element_located((By.ID, 'user_password')))
username_field.send_keys(USERNAME)
password_field.send_keys(PASSWORD)
password_field.submit()

wait.until(EC.presence_of_element_located((By.CLASS_NAME, 'navbar-brand')))

driver.get('https://simon.studentworks.com/jobs/past')

email_pattern = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
emails = []
count = 0
while (count<50):
    html_source = driver.page_source
    soup = BeautifulSoup(html_source, 'html.parser')

    for tr in soup.find_all("tr"):
        if CLIENT_STATUS in tr.get_text():
           text_content = tr.get_text(separator=" ").strip()
           emails.extend(email_pattern.findall(text_content))
        
    try:
        next_button = driver.find_element(By.XPATH, '//a[@aria-controls="DataTables_Table_0" and text()="Next"]')
        if "disabled" in next_button.get_attribute("class"):
            print("No more pages.")
            break
        next_button.click()
    except Exception:
        print("No more pages or error navigating.")
        break
    count += 1

driver.quit()

emails = list(set(emails))
print("\n\nHere is the email addresses of all",CLIENT_STATUS.lower(), "past clients in your turf:\n")
print(", ".join(emails))

input("press ENTER to close")