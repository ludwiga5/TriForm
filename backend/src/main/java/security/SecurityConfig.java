package security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.NullSecurityContextRepository;
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
            .securityContext(context 
                -> context.securityContextRepository(new NullSecurityContextRepository())
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
            .authorizeHttpRequests(authorize 
                -> authorize
                .requestMatchers("/api/public/**", "/api/login", "/api/register").permitAll()
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
