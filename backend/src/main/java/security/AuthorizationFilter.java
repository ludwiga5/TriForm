package security;

import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import services.JwtService;
import repositories.UserRepository;
import entities.User;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.MissingClaimException;
import io.jsonwebtoken.security.SignatureException;
import io.micrometer.common.lang.NonNull;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.FilterChain;

@Component
public class AuthorizationFilter extends OncePerRequestFilter{

    private final JwtService jwtService;
    private final UserRepository userRepository;

    //Injects
    public AuthorizationFilter(JwtService jwtService, UserRepository userRepository){
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }



    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)


        throws ServletException, IOException {

        //Hardcored Short Circuit for non-auth access
        String requestUrl = request.getRequestURI();
        if(requestUrl.startsWith("/api/public") || requestUrl.startsWith("/api/login") || requestUrl.startsWith("/api/register"))
        {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        String token;
        String username;

        //Checks & Strips Auth: Bearer just token
        if(header!=null && header.startsWith("Bearer")){
            token = header.substring(7);
        }
        else{
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        //Token & User Authentication
        try{
        jwtService.validateToken(token);
        username = jwtService.extractUsername(token);
        }
        catch(ExpiredJwtException | SignatureException | MalformedJwtException | MissingClaimException e){
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        User user = userRepository.findByUsername(username);
        if(user==null){
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        //Set user in security context
        org.springframework.security.core.context.SecurityContextHolder
            .getContext()
            .setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                    username, null, new java.util.ArrayList<>()
                )
            );
        
        //Passes
        filterChain.doFilter(request, response);

        }



}
