const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
let patients=JSON.parse(localStorage.getItem("mc_patients")||"[]");
let doctors=JSON.parse(localStorage.getItem("mc_doctors")||"[]");
let appointments=JSON.parse(localStorage.getItem("mc_appointments")||"[]");

if(!patients.length) patients=[
{id:"P1001",name:"Aarav Sharma",age:28,gender:"Male",disease:"Fever",doctor:"Dr. Ananya Mehta",phone:"9876543210"},
{id:"P1002",name:"Priya Singh",age:34,gender:"Female",disease:"Migraine",doctor:"Dr. Rahul Verma",phone:"9812345678"},
{id:"P1003",name:"Rohan Kumar",age:45,gender:"Male",disease:"Diabetes",doctor:"Dr. Ananya Mehta",phone:"9898989898"}];
if(!doctors.length) doctors=[
{id:"D101",name:"Dr. Ananya Mehta",specialization:"General Physician"},
{id:"D102",name:"Dr. Rahul Verma",specialization:"Cardiologist"},
{id:"D103",name:"Dr. Neha Kapoor",specialization:"Dermatologist"}];
if(!appointments.length) appointments=[
{patient:"Aarav Sharma",doctor:"Dr. Ananya Mehta",date:new Date().toISOString().slice(0,10),time:"10:30 AM",reason:"Routine Checkup",status:"Scheduled"},
{patient:"Priya Singh",doctor:"Dr. Rahul Verma",date:new Date(Date.now()+86400000).toISOString().slice(0,10),time:"12:00 PM",reason:"Consultation",status:"Scheduled"}];
save();

function save(){localStorage.setItem("mc_patients",JSON.stringify(patients));localStorage.setItem("mc_doctors",JSON.stringify(doctors));localStorage.setItem("mc_appointments",JSON.stringify(appointments));}
function toast(msg){let t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function initials(n){return n.replace("Dr.","").trim().split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()}
function fmtDate(d){return new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}

function render(){
 $("#patientCount").textContent=patients.length;$("#doctorCount").textContent=doctors.length;$("#appointmentCount").textContent=appointments.length;
 let today=new Date().toISOString().slice(0,10);$("#todayCount").textContent=appointments.filter(a=>a.date===today).length;
 let recent=patients.slice(-5).reverse();$("#recentPatients").innerHTML=recent.length?recent.map(p=>`<div class="mini-row"><b>${p.name}</b><span>${p.disease} · ${p.doctor}</span></div>`).join(""):`<div class="empty">No patients yet</div>`;
 let upcoming=appointments.slice().sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5);$("#upcomingAppointments").innerHTML=upcoming.length?upcoming.map(a=>`<div class="mini-row"><b>${a.patient}</b><span>${fmtDate(a.date)} · ${a.time}</span></div>`).join(""):`<div class="empty">No appointments</div>`;
 renderPatients();renderDoctors();renderAppointments();
}
function renderPatients(filter=""){
 let arr=patients.filter(p=>(p.name+p.id+p.disease+p.doctor).toLowerCase().includes(filter.toLowerCase()));
 $("#patientTable").innerHTML=arr.length?arr.map(p=>`<tr><td><b>${p.id}</b></td><td><b>${p.name}</b></td><td>${p.age}</td><td>${p.gender}</td><td>${p.disease}</td><td>${p.doctor}</td><td>${p.phone}</td><td><button class="table-action" onclick="editPatient('${p.id}')">Edit</button><button class="table-action danger" onclick="deletePatient('${p.id}')">Delete</button></td></tr>`).join(""):`<tr><td colspan="8" class="empty">No patients found</td></tr>`;
}
function renderDoctors(){
 $("#doctorGrid").innerHTML=doctors.length?doctors.map(d=>`<div class="doctor"><div class="doctor-top"><div class="doc-avatar">${initials(d.name)}</div><div><h3>${d.name}</h3><p>${d.id}</p></div></div><div class="special">${d.specialization}</div><button class="table-action danger" onclick="deleteDoctor('${d.id}')">Remove Doctor</button></div>`).join(""):`<div class="empty">No doctors found</div>`;
}
function renderAppointments(){
 $("#appointmentTable").innerHTML=appointments.length?appointments.map((a,i)=>`<tr><td><b>${a.patient}</b></td><td>${a.doctor}</td><td>${fmtDate(a.date)}</td><td>${a.time}</td><td>${a.reason}</td><td><span class="pill ${a.status.toLowerCase()}">${a.status}</span></td><td><button class="table-action" onclick="toggleStatus(${i})">${a.status==="Completed"?"Undo":"Complete"}</button><button class="table-action danger" onclick="deleteAppointment(${i})">Delete</button></td></tr>`).join(""):`<tr><td colspan="7" class="empty">No appointments found</td></tr>`;
}

function openModal(title,html){$("#modalTitle").textContent=title;$("#modalForm").innerHTML=html;$("#modal").classList.add("show")}
function closeModal(){$("#modal").classList.remove("show")}
function openPatientModal(p=null){
 openModal(p?"Edit Patient":"Add Patient",`<div class="form-grid">
 <div class="field"><label>Patient ID</label><input id="f_id" required value="${p?.id||"P"+(1001+patients.length)}" ${p?"readonly":""}></div>
 <div class="field"><label>Name</label><input id="f_name" required value="${p?.name||""}"></div>
 <div class="field"><label>Age</label><input id="f_age" type="number" min="0" required value="${p?.age||""}"></div>
 <div class="field"><label>Gender</label><select id="f_gender"><option ${p?.gender==="Male"?"selected":""}>Male</option><option ${p?.gender==="Female"?"selected":""}>Female</option><option ${p?.gender==="Other"?"selected":""}>Other</option></select></div>
 <div class="field"><label>Condition / Disease</label><input id="f_disease" required value="${p?.disease||""}"></div>
 <div class="field"><label>Doctor</label><select id="f_doctor">${doctors.map(d=>`<option ${p?.doctor===d.name?"selected":""}>${d.name}</option>`).join("")}</select></div>
 <div class="field full"><label>Phone</label><input id="f_phone" required value="${p?.phone||""}"></div>
 <button class="primary form-submit">${p?"Update":"Add"} Patient</button></div>`);
 $("#modalForm").onsubmit=e=>{e.preventDefault();let obj={id:$("#f_id").value,name:$("#f_name").value,age:$("#f_age").value,gender:$("#f_gender").value,disease:$("#f_disease").value,doctor:$("#f_doctor").value,phone:$("#f_phone").value};let i=patients.findIndex(x=>x.id===obj.id);if(i>=0)patients[i]=obj;else patients.push(obj);save();render();closeModal();toast(p?"Patient updated":"Patient added successfully")};
}
function editPatient(id){openPatientModal(patients.find(p=>p.id===id))}
function deletePatient(id){if(confirm("Delete this patient?")){patients=patients.filter(p=>p.id!==id);save();render();toast("Patient deleted")}}
function openDoctorModal(){
 openModal("Add Doctor",`<div class="form-grid"><div class="field"><label>Doctor ID</label><input id="d_id" required value="D${101+doctors.length}"></div><div class="field"><label>Doctor Name</label><input id="d_name" required placeholder="Dr. Name"></div><div class="field full"><label>Specialization</label><input id="d_spec" required placeholder="e.g. Cardiologist"></div><button class="primary form-submit">Add Doctor</button></div>`);
 $("#modalForm").onsubmit=e=>{e.preventDefault();doctors.push({id:$("#d_id").value,name:$("#d_name").value,specialization:$("#d_spec").value});save();render();closeModal();toast("Doctor added successfully")};
}
function deleteDoctor(id){if(confirm("Remove this doctor?")){doctors=doctors.filter(d=>d.id!==id);save();render();toast("Doctor removed")}}
function openAppointmentModal(){
 openModal("New Appointment",`<div class="form-grid"><div class="field"><label>Patient</label><select id="a_patient">${patients.map(p=>`<option>${p.name}</option>`).join("")}</select></div><div class="field"><label>Doctor</label><select id="a_doctor">${doctors.map(d=>`<option>${d.name}</option>`).join("")}</select></div><div class="field"><label>Date</label><input id="a_date" type="date" required value="${new Date().toISOString().slice(0,10)}"></div><div class="field"><label>Time</label><input id="a_time" type="time" required value="10:00"></div><div class="field full"><label>Reason</label><input id="a_reason" required placeholder="Routine checkup"></div><button class="primary form-submit">Book Appointment</button></div>`);
 $("#modalForm").onsubmit=e=>{e.preventDefault();let t=$("#a_time").value;let [h,m]=t.split(":");let ap=(+h%12||12)+":"+m+" "+(+h>=12?"PM":"AM");appointments.push({patient:$("#a_patient").value,doctor:$("#a_doctor").value,date:$("#a_date").value,time:ap,reason:$("#a_reason").value,status:"Scheduled"});save();render();closeModal();toast("Appointment booked")};
}
function toggleStatus(i){appointments[i].status=appointments[i].status==="Completed"?"Scheduled":"Completed";save();render();toast("Appointment updated")}
function deleteAppointment(i){if(confirm("Delete this appointment?")){appointments.splice(i,1);save();render();toast("Appointment deleted")}}

const titles={dashboard:["Dashboard","Overview of hospital operations"],patients:["Patients","Manage patient information"],doctors:["Doctors","Manage hospital doctors"],appointments:["Appointments","Schedule and manage appointments"]};
$$(".nav").forEach(b=>b.onclick=()=>go(b.dataset.page));
$$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
function go(page){$$(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===page));$$(".page").forEach(x=>x.classList.remove("active-page"));$("#"+page).classList.add("active-page");$("#pageTitle").textContent=titles[page][0];$("#pageSub").textContent=titles[page][1];$(".sidebar").classList.remove("open")}
$("#patientSearch").oninput=e=>renderPatients(e.target.value);
$("#mobileMenu").onclick=()=>$(".sidebar").classList.toggle("open");
$("#date").textContent=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
render();
