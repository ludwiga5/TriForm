package config;

//Imports
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

//Handles Database Pathing & Connection Handling
public class DatabaseManager {

    
    public static String dbPath = "jdbc:sqlite:/main/data/tiform.db";
    public static String templaceDbPath = "jdbc:sqlite:/main/resources/db/migration/triform.db";

    public void connect(){

        try{
            Connection conn = DriverManager.getConnection(dbPath);
            if(conn != null){
                System.out.println("Connection Successful!");
            }
            conn.close();
        } catch (SQLException e){
            System.out.println("Connection Failed: " + e.getMessage());
        }
    }
}

