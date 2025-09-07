fetch('https://frostcore.onrender.com/api/users/me')
  .then(res => res.json())
  .then(data => {
    document.getElementById('content').innerText = JSON.stringify(data, null, 2);
  })
  .catch(err => console.error(err));
