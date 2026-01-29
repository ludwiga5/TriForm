package config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;


@ConfigurationProperties(prefix = "jwt")
@Component
public class JwtProperties {
    
    private String secret;
    private long expirationMs;

    //Getters
    public String getSecret(){
        return secret;
    }
    public long getExpirationMs(){
        return expirationMs;
    }

    //Setters
    public void setSecret(String secret){
        this.secret = secret;
    }
    public void setExpirationMs(long expirationMs){
        this.expirationMs = expirationMs;
    }

}
