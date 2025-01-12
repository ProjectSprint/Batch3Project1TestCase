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
### Cookbook 🍳
- How can I know what's the payload that k6 give and what it receives? Run in debug mode:
    ```bash
        DEBUG=true BASE_URL=http://localhost:8080 k6 run main.js
    ```
    even better, pipe it to a file for easier searching
    ```bash
        DEBUG=true BASE_URL=http://localhost:8080 k6 run main.js &> output.txt
    ```


### Environment Variables
- `BASE_URL` (string,url) sets the base url of the backend
- `DEBUG` (boolean) show what was sent to the backend, and what is the response
