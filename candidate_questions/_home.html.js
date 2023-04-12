module.exports = `
<div class="home view">
  <h3 data-focus tabindex="-1"><span class="sr-only">List of</span> Candidates</h3>
  <hr>
  <ul class="people">
    <% data.candidates.forEach(function(c) { %>
    
      <li> 
        <a 
          <% if (c.responded) { %> href="#/candidate/<%= c.short %>" <% } %>
        >

        <!-- mugshot or blank photo -->
        <% if (c.photo) { %>
          <img alt="" class="mug" src="./assets/<%= c.photo %>">
        <% } else { %>
          <div class="mug placeholder"></div>
        <% } %>

        <!-- candidate name and party info -->

        <%= c.name %>
        <%= c.party_short ? "(" + c.party_short + ")" : '' %>
        <% if (c.incumbent) { %>
          <span class ="incumbent">*</span>
        <% } %> 
        
        <!-- flag for 0 responses -->
        <br> 
        <% if (!c.responded) { %>
          <i>No response</i>
        <% } %>

        </a>
      </li>
    <% }); %>
  </ul>

  <h3>Questions</h3>
  <hr>
  <div class="subhed">Reader-submitted questions are indicated with &#128172;</i></div>
  <ul class="questions">
    <% data.questions.forEach(function(q) { %>
    <li> 
      <a href="#/question/<%= q.short %>"><%= q.question.trim() %></a>
      <% if (q.reader) { %>
        <span> &#128172; </span> 
      <% } %>  
    </li>
    <% }); %>
   
  </ul>
</div>
`