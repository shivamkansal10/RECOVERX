package com.example.lostandfound.security;

import com.example.lostandfound.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull; // <-- Swapped to Spring's NonNull
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    // Note: Make sure this exactly matches your filename! (Custom vs Customer)
    private final CustomerUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return; // Stop here! Do not try to parse a JWT for login/register.
        }

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        // 4. Use our JwtUtil to crack open the token and read the email
        userEmail = jwtUtil.extractUsername(jwt);

        // 5. If we found an email AND the user isn't already authenticated for this specific request...
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Get the user from the database
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);



            // 6. If the token is mathematically valid and not expired...
            if (jwtUtil.isTokenValid(jwt, userDetails)) {

                // 7. Create an official Spring Security VIP Pass
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 8. Put the VIP Pass in the Security Context so the rest of the application knows they are allowed in!
                SecurityContextHolder.getContext().setAuthentication(authToken);

            } // <-- FIXED: Closed the isTokenValid 'if' statement
        } // <-- FIXED: Closed the userEmail 'if' statement

        // 9. THE GOLDEN RULE! Pass the request to the next guard so it can reach the Controller!
        filterChain.doFilter(request, response);

    } // <-- FIXED: Closed the doFilterInternal method
}