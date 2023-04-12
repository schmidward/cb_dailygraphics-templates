module.exports = `
<div class="candidate view">
  <% var { candidate, questions } = data; %>
  <a class="home-link" href="#/">&laquo; See all</a>

  <div class="bio">
    <% if (candidate.photo) { %>
      <img alt="" class="mug" src="./assets/<%= candidate.photo %>">
    <% } else { %>
      <div class="mug placeholder"></div>
    <% } %>

    <div class="text">
      <h3 data-focus tabindex="-1"><%= candidate.name %></h3>
      <% if (candidate.party) { %>
        <b>Party:</b> <%= candidate.party %><br>
      <% } %>
      <% if (candidate.website) { %>
      <a href="<%= candidate.website.match(/^http/) ? candidate.website : "https://" + candidate.website %>" target="_blank">
        Campaign site
      </a>
      <% } %>
    </div>

  </div>

<div class="bio-text"> 
    <% for (var { column, label } of window.BIO) { if (!candidate[column]) continue; %>
        <b><%= label %>:</b> <%= candidate[column] %><br>
    <% } %>
</div>

  <div class="questions">
    <% questions.forEach(function(q) { %>
    <div class="q">
      <h4>Q:
        <%= q.question %>
        <% if (q.reader) { %>
          (Reader-submitted)
        <% } %>
      </h4>
      <blockquote>
        <p>
          <%= candidate[q.short] %>
      </blockquote>
      <% if (data.compare) { %>
      <a class="compare-link" href="#/question/<%= q.short %>">
        See other candidate responses &raquo;
      </a>
      <% } %>
    </div>
    <% }); %>
  </div>
</div>
`