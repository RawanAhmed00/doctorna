# Doctorna API Summary for Postman AI

Copy and paste the text below into the "Create with Postman AI" prompt box:

---

Build a complete RESTful API collection for a Clinic/Doctor Management system named "Doctorna". Organize the requests exactly into the following folders, including appropriate JSON request bodies and query parameters. Assume the base URL is {{base_url}}.

1. **Authentication**
   - POST /auth/login
   - POST /auth/register
   - POST /auth/forget-password
   - POST /auth/reset-password

2. **Doctor Module**
   - GET /doctors
   - GET /doctors/:id
   - POST /doctors
   - PUT /doctors/:id
   - DELETE /doctors/:id
   - PATCH /doctors/:id/availability

3. **Patient (Users) Module** (Generate Pagination query params e.g., ?page=1&limit=10)
   - GET /patients
   - GET /patients/:id
   - POST /patients
   - PUT /patients/:id
   - DELETE /patients/:id

4. **Appointment Module** (Generate Filtration query params e.g., ?status=pending&date=YYYY-MM-DD)
   - GET /appointments
   - GET /appointments/:id
   - POST /appointments

5. **Sub Services Module**
   - GET /sub-services
   - GET /sub-services/:id
   - POST /sub-services

6. **Speciality Module**
   - GET /specialities
   - GET /specialities/:id
   - POST /specialities
   - PUT /specialities/:id

Schema context for JSON bodies: 
- Users: name, email, password, age, gender, phone, role.
- Doctor: name, email, rank, gender, is_available, spec_id.
- Appointments: status, date_time, user_id, doc_id.
- Sub_services: name, fees, description.
- Speciality: name, description.
