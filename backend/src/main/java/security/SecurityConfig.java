package security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.savedrequest.NullRequestCache;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AuthorizationFilter authorizationFilter;

    //Injects
    public SecurityConfig(AuthorizationFilter authorizationFilter){
        this.authorizationFilter = authorizationFilter;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{

    
        http

            .sessionManagement(session 
                -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .requestCache(cache 
                -> cache.requestCache(new NullRequestCache())
            )
            .formLogin(form 
                ->form.disable()
            )
            .csrf(csrf 
                -> csrf
                .disable()
            )
            .httpBasic(basic 
                -> basic
                .disable()
            )
            .addFilterBefore(authorizationFilter, UsernamePasswordAuthenticationFilter.class)
            
            //Selects which enpoints require authentication
            .authorizeHttpRequests(authorize 
                -> authorize
                .requestMatchers("/api/public/**", "/api/login", "/api/register").permitAll()
                .requestMatchers("/api/profile").authenticated()
                .anyRequest().authenticated()
            );


        return http.build();
    }

    //Remove the default users
    @Bean
    public InMemoryUserDetailsManager userDetailsService() {
        return new InMemoryUserDetailsManager();
    }
}
