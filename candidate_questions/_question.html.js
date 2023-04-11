module.exports = `
<div class="questions view">
  <a class="home-link" href="#/">&laquo; See all</a>

  <% var { candidates, question, short, nextQuestion, nextID, reader } = data; %>
  <h3 data-focus tabindex="-1">Q: <%= question %></h3>
  <% candidates.forEach(function(c) { %>
  <% if (c.responded) { %>
  <a href="#/candidate/<%= c.short %>">
    <h4>
      <% if (c.photo) { %>
        <img alt="" class="mug" src="./assets/<%= c.photo %>">
      <% } else { %>
        <div class="mug placeholder"></div>
      <% } %>
      <%= c.name %>
    </h4>
  </a>
  <blockquote>
      <%= c[short] %>
  </blockquote><br>
  <% } %>
  <% }); %>

  <a class="next-question" href="#/question/<%= nextID %>">Next question: <%= nextQuestion %></a>

  <a class="home-link" href="#/">&laquo; See all</a>
</div>
`