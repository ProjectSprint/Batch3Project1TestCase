# GoGoManager Test Cases!
## ProjectSprint Batch 3 Project 1

### Prerequisites
- [ k6 ](https://k6.io/docs/get-started/installation/)

### How to start
- Navigate to the folder where this is extracted / clone in terminal
- run
    ```bash
    BASE_URL=http://localhost:8080 k6 run main.js
    ```
    ⚠️ Adjust the `BASE_URL` value to your backend path

### Environment Variables
- `BASE_URL` (string,url) sets the base url of the backend
- `DEBUG` (boolean) show what was sent to the backend, and what is the response
